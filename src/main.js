import { createProvider } from './vue-apollo'

//main entry point for charts
//closure to pass the createProvider function in
window.graphqlCharts =
((createProvider) => {
    return function(authName, apiKey)
    {
        //verify parameters
        if (!authName || !apiKey)
        {
            throw new Error("Invalid authName or apiKey passed to graphqlCharts()");
        }

        authName = authName.toString();
        apiKey = apiKey.toString();

        const apolloProvider = createProvider();
        const provide = apolloProvider.provide();

        //all js files in /src/reports
        var context = require.context(
            "./reports",
            false, //recursive
            /(.+)\.js$/
        );

        //loop through each js file and run the exported default function
        context.keys().forEach(function(key){
            let exportedFunction = context(key).default;
            if (!exportedFunction || typeof(exportedFunction) !== "function")
            {
                return;
            }

            exportedFunction(authName, apiKey, provide);
        });
    }
})(createProvider);