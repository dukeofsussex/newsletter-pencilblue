'use strict';

module.exports = function(pb) {

    //PB dependencies
    var util = pb.util;

    function NewsletterService(context) {
        this.context = context;
        var NewsletterSendJob = pb.PluginService.getService('NewsletterSendJob', 'newsletter-pencilblue', context.site);
        this.newsletterSendJob = new NewsletterSendJob(context);
    };

    var SERVICE_NAME = 'NewsletterService';

    NewsletterService.init = function(cb) {
        pb.log.debug("NewsletterService: Initialized");
        cb(null, true);
    };

    NewsletterService.getName = function() {
        return SERVICE_NAME;
    };

    NewsletterService.prototype.sendConfirmationEmail = function(subscriber, cb) {
        var self = this;
        var siteService = new pb.SiteService();
        siteService.getByUid(self.site, function(err, siteInfo) {
            if (pb.util.isError(err)) {
                pb.log.error("SiteService: Failed to load site with getByUid. ERROR[%s]", err.stack);
                return cb(err, null);
            }
            var emailService = new pb.EmailService({site: self.context.site});
            emailService.getSettings(function (err, emailSettings) {
                if (pb.util.isError(err)) {
                    pb.log.error("EmailService: Failed to load email settings. ERROR[%s]", err.stack);
                    return cb(err, null);
                }
                var options = {
                    to: subscriber.email,
                    subject: siteInfo.displayName + ' Newsletter Confirmation',
                    template: 'email/confirmation',
                    replacements: {
                        activation_url: pb.SiteService.getHostWithProtocol(siteInfo.hostname) + '/newsletter/confirm/' + subscriber.id
                    }
                };
                
                emailService.sendFromTemplate(options, cb);
            });
        });
    };

    NewsletterService.prototype.sendNewsletters = function(newsletter) {
        var job = this.newsletterSendJob;
        job.init('SENDING_NEWSLETTER');
        job.setNewsletter(newsletter);
        job.setParallelLimit(10);
        job.setChunkOfWorkPercentage(1);
        job.run(util.cb);
        return job.getId();
    };

    //exports
    return NewsletterService;
};
