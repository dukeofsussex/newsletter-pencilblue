'use strict';

module.exports = function(pb){

    //PB dependencies
    var util = pb.util;
    var ValidationService = pb.ValidationService;

    var NewsletterController = function() {};
    util.inherits(NewsletterController, require('../../pencilblue/controllers/index')(pb));
    
    var ACTION_RESPONSES = {
        confirm: {
            pageName: 'Newsletter Confirmation',
            message: 'Thank you for confirming your email address. You have been successfully added to the newsletter recipients'
        },
        unsubscribe: {
            pageName: 'Subscription Cancelling',
            message: 'Your subscription has been successfully cancelled'
        }
    };
    
    NewsletterController.prototype.init = function(context, cb) {
        var self = this;
        var init = function(err) {
            self.subscriptionService = pb.PluginService.getService('SubscriptionService', 'newsletter-pencilblue', self.site);
            self.dao = new pb.DAO();

            cb(null, true);
        };
        NewsletterController.super_.prototype.init.apply(this, [context, init]);
    };
    
    NewsletterController.prototype.render = function(cb) {
        var self = this;
        var output = {
            content_type: 'text/html',
            code: 200
        };
        if (!ValidationService.isIdStr(self.pathVars.id, true)) {
            return self.reqHandler.serve404();
        }
        this.handleAction(function (err) {
            if (err) {
                return cb(err);
            }
            self.gatherData(function(err, data) {
                self.ts.registerLocal('current_url', self.req.url);
                self.ts.registerLocal('navigation', new pb.TemplateValue(data.nav.navigation, false));
                self.ts.registerLocal('account_buttons', new pb.TemplateValue(data.nav.accountButtons, false));
                self.ts.registerLocal('alert_message', ACTION_RESPONSES[self.pathVars.action].message);
                self.ts.registerLocal('page_name', ACTION_RESPONSES[self.pathVars.action].pageName + ' | ' + pb.config.siteName);
                self.ts.load('actions', function(err, template) {
                    if (util.isError(err)) {
                        return cb(err);
                    }
                    output.content = template;
                    return cb(output);
                });
            });
        });
    };

    NewsletterController.prototype.handleAction = function(cb) {
        switch(this.pathVars.action) {
            case 'confirm':
                this.handleConfirmation(cb);
                break;
            case 'unsubscribe':
                this.handleUnsubscribe(cb);
                break;
            default:
                var err = new Error('Unknown action');
                err.code = 404;
                return cb(err);
        }
    };
    
    NewsletterController.prototype.handleConfirmation = function(cb) {
        var self = this;
        
        this.dao.loadById(this.pathVars.id, this.subscriptionService.getCollectionType(), function(err, dto) {
            if (err) {
                return cb(err);
            } else if (!dto) {
                var err = new Error('Invalid identifier: ' + self.pathVars.id);
                err.code = 404;
                return cb(err);
            }
            dto.verified = 1;
            self.dao.save(dto, function() {
                if (err) {
                    return cb(err);
                }
                return cb(null);
            });
        });
    };

    NewsletterController.prototype.handleUnsubscribe = function(cb) {
        var self = this;

        this.dao.deleteById(this.pathVars.id, this.subscriptionService.getCollectionType(), function(err, res) {
            if (err) {
                return cb(err);
            } else if (res.result.n === 0) {
                var err = new Error('Invalid identifier: ' + self.pathVars.id);
                err.code = 404;
                return cb(err);
            }
            return cb(null);
        });
    };

    NewsletterController.getRoutes = function(cb){
        var routes = [
            {
                method: 'get',
                path: '/newsletter/:action/:id',
                auth_required: false,
                content_type: 'text/html'
            }
        ];

        return cb(null, routes);
    };

    return NewsletterController;
};
