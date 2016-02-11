module.exports = function(RED) {

    var oauth2 = require('./lib/oauth2.js');
    var papr = require('./lib/papr.js');
    var customer = require('./lib/customer.js');

    function PaprGetStock(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        node.yaasCustomerCredentials = RED.nodes.getNode(config.yaasCustomerCredentials);
        node.yaasCredentials = RED.nodes.getNode(config.yaasCredentials);
        node.status({fill:"yellow",shape:"dot",text:"idle"});

        node.on('input', function(msg) {

            node.status({fill:"green",shape:"dot",text:"reading"});
            var customerToken;

            oauth2.getClientCredentialsToken(node.yaasCredentials.client_id, node.yaasCredentials.client_secret, [])
            .then(function(authData) {

                return customer.login(authData.tenant, authData.access_token, node.yaasCustomerCredentials.email, node.yaasCustomerCredentials.password)
                .then(function(token){
                    console.log('papr customer token: ' + token);
                    customerToken = token;
                    return customer.me(authData.tenant, customerToken);
                })
                .then(function(customer){
                    console.log('papr got customer id:  ' + customer.customerNumber);
                    return papr.getStock(customerToken);
                });
            })
            .then(function(body){
                node.status({fill:"yellow",shape:"dot",text: "stock: " + body.stockLevel + " reorder: " + body.reorderLevel});
                node.send({payload:body});
            })
            .catch(function(e){
                console.error(e);
            });
        });
    }

    function PaprAdd(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        node.yaasCustomerCredentials = RED.nodes.getNode(config.yaasCustomerCredentials);
        node.yaasCredentials = RED.nodes.getNode(config.yaasCredentials);
        node.status({fill:"yellow",shape:"dot",text:"idle"});

        node.on('input', function(msg) {
          
            var quantity = Math.round(node.quantity) || 1;
            node.status({fill:"green",shape:"dot",text:"adding " + quantity});
            var customerToken;

            oauth2.getClientCredentialsToken(node.yaasCredentials.client_id, node.yaasCredentials.client_secret, [])
            .then(function(authData) {

                return customer.login(authData.tenant, authData.access_token, node.yaasCustomerCredentials.email, node.yaasCustomerCredentials.password)
                .then(function(token){
                    console.log('add papr customer token: ' + token);
                    customerToken = token;
                    return customer.me(authData.tenant, customerToken);
                })
                .then(function(customer){
                    console.log('papr got customer id:  ' + customer.customerNumber);
                    return papr.add(customerToken, quantity);
                });
            })
            .then(function(body){
                node.status({fill:"yellow",shape:"dot",text: "stock: " + body.stockLevel + " reorder: " + body.reorderLevel});
                node.send({payload:body});
            })
            .catch(function(e){
                console.error(e);
            });
        });
    }
    
    function PaprDecrease(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        node.yaasCustomerCredentials = RED.nodes.getNode(config.yaasCustomerCredentials);
        node.yaasCredentials = RED.nodes.getNode(config.yaasCredentials);
        node.status({fill:"yellow",shape:"dot",text:"idle"});

        node.on('input', function(msg) {
            node.status({fill:"green",shape:"dot",text:"decreasing"});
            var customerToken;

            oauth2.getClientCredentialsToken(node.yaasCredentials.client_id, node.yaasCredentials.client_secret, [])
            .then(function(authData) {

                return customer.login(authData.tenant, authData.access_token, node.yaasCustomerCredentials.email, node.yaasCustomerCredentials.password)
                .then(function(token){
                    console.log('decrease papr customer token: ' + token);
                    customerToken = token;
                    return customer.me(authData.tenant, customerToken);
                })
                .then(function(customer){
                    console.log('papr got customer id:  ' + customer.customerNumber);
                    return papr.decrease(customerToken);
                });
            })
            .then(function(body){
                node.status({fill:"yellow",shape:"dot",text: "stock: " + body.quantity});
                node.send({payload:body});
            })
            .catch(function(e){
                console.error(e);
            });
        });
    }

    RED.nodes.registerType('get papr stock', PaprGetStock);
    RED.nodes.registerType('papr add', PaprAdd);
    RED.nodes.registerType('papr decrease', PaprDecrease);
};