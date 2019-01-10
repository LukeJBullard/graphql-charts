import gql from 'graphql-tag'
import { onLogin } from './vue-apollo'

var isLoggingIn = false;

async function auth(dollarApollo, authName, apiKey)
{
    return new Promise(function(resolve, reject){
        dollarApollo.mutate({
            mutation: gql`
                mutation ($authName: String!, $apiKey: String!) {
                    login(authName: $authName, apiKey: $apiKey)
                }
            `,
            variables: {
                apiKey,
                authName
            },
            update: (function(dollarApollo, parentResolve){
                return function(store, { data: { login }}){
                    if (login)
                    {
                        onLogin(dollarApollo.getClient(), login);
                        parentResolve(true);
                    }
                };
            })(dollarApollo, resolve)
        }).catch(function(err){
            reject(err);
        });
    });
}

export default async function authThenRetry(error, query, dollarApollo, authName, apiKey)
{
    //if already logging in
    if (isLoggingIn)
    {
        return Promise.resolve();
    }

    isLoggingIn = true;

    if (error.networkError)
    {
        //dont retry after network errors
        return Promise.resolve();
    }

    if (error.graphQLErrors)
    {
        //see if not authenticated error was passed
        const BreakException = "BreakException";
        var notLoggedIn = false;

        try {
            error.graphQLErrors.map(({ message }) => {
                if (message == "Not Logged In")
                {
                    notLoggedIn = true;
                    throw BreakException;
                }
            });
        } catch (e)
        {
            if (e !== BreakException)
            {
                throw e;
            }
        }

        //not authenticated was passed. login and retry query
        if (notLoggedIn)
        {
            dollarApollo.getClient().resetStore();

            return auth(dollarApollo, authName, apiKey)
            .then(function(){
                try {
                    isLoggingIn = false;
                    query.refetch();
                } catch (e)
                {
                    // eslint-disable-next-line no-console
                    console.log('%cError', 'background: red; color: white; padding: 2px 4px; border-radius: 3px; font-weight: bold;', e.message);
                }
                return true;
            });
        }
    }
}