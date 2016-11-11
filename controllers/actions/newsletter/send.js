'use strict';

module.exports = function(pb) {

    //PB dependencies
    var util = pb.util;

    function NewsletterSendingController(){}
    util.inherits(NewsletterSendingController, pb.BaseAdminController);

    NewsletterSendingController.prototype.extendedInit = function(cb) {
        this.siteQueryService = new pb.SiteQueryService({site: this.site, onlyThisSite: true});
        this.settings = pb.SettingServiceFactory.getServiceBySite(this.site, true);
        var NewsletterService = pb.PluginService.getService('NewsletterService', 'newsletter-pencilblue', this.site);
        this.newsletterService = new NewsletterService(this.getServiceContext());
        cb();
    };

    NewsletterSendingController.prototype.render = function(cb) {
        var self = this;

        this.getJSONPostParams(function(err, params) {
            var message = self.hasRequiredParams(params, self.getRequiredFields());
            if (message) {
                return cb({
                    code: 400,
                    content: pb.BaseController.apiResponse(pb.BaseController.API_FAILURE, message)
                });
            }
            console.log(params);
            self.send(params, cb);
        });
    };
    
    NewsletterSendingController.prototype.send = function(newsletter, cb) {
        var jobId   = this.newsletterService.sendNewsletters(newsletter);
        var content = pb.BaseController.apiResponse(pb.BaseController.API_SUCCESS, 'Sending newsletters', jobId);
        return cb({content: content});
    };

    NewsletterSendingController.prototype.getRequiredFields = function() {
        return ['subject', 'use_template', 'layout'];
    };

    NewsletterSendingController.prototype.getSanitizationRules = function() {
        return {
            layout: pb.BaseController.getContentSanitizationRules()
        };
    };
    
    NewsletterSendingController.getRoutes = function(cb) {
        var routes = [
            {
                method: 'post',
                path: "/actions/admin/newsletter/send",
                access_level: pb.SecurityService.ACCESS_WRITER,
                auth_required: true,
                content_type: 'text/html'
            }
        ];

        return cb(null, routes);
    };

    return NewsletterSendingController;
};
