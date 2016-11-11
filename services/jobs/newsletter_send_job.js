'use strict';

module.exports = function(pb) {

    //PB dependencies
    var util = pb.util;
    var DAO = new pb.DAO;
    var PluginService = new pb.PluginService;
    var SiteService = new pb.SiteService;

    function NewsletterSendJob(context) {
        this.context = context;
        this.newsletter = {};
        this.subscribers = [];
    }
    util.inherits(NewsletterSendJob, pb.AsyncJobRunner);

    var SERVICE_NAME = 'NewsletterSendJob';

    NewsletterSendJob.init = function(cb) {
        pb.log.debug("NewsletterSendJob: Initialized");
        cb(null, true);
    };

    NewsletterSendJob.getName = function() {
        return SERVICE_NAME;
    };
    
    NewsletterSendJob.prototype.getNewsletter = function(newsletter) {
        return this.newsletter;
    };
    
    NewsletterSendJob.prototype.setNewsletter = function(newsletter) {
        this.newsletter = newsletter;
    };

    /**
     * Responsible for providing an array or hash of tasks that will be executed by
     * the job.  The extending implmentation MUST override this function or an
     * error will be thrown.
     * @method getTasks
     * @param {Function} cb A callback that takes two parameters: cb(Error, Object|Array)
     */
    NewsletterSendJob.prototype.getTasks = function(cb) {
        var self = this;
        var SubscriptionService = pb.PluginService.getService('SubscriptionService', 'newsletter-pencilblue', this.site);

        DAO.q(SubscriptionService.getCollectionType(), {where: {verified: true}, select: {email: 1}}, function (err, subscribers) {
            if (err) { 
                return cb(err);
            }
            self.subscribers = subscribers;
            var tasks = util.getTasks(subscribers, function(subscribers, i) {
                return function(callback) {
                    self.onUpdate(100 / subscribers.length);
                    self.sendNewsletter(subscribers[i].email, callback);
                };
            });
            return cb(null, tasks);
        });
    };
    
    NewsletterSendJob.prototype.processResults = function(err, results, cb) {
        this.onCompleted();
        cb(err, results);
    };

    /**
     * Called directly before the first tasks begins to execute.  It is recommended
     * that the extending implementation override this function in order to call
     * the "onStart" function.
     * @method onBeforeFirstTask
     * @param {Function} cb A callback that takes one optional error parameter
     */
    NewsletterSendJob.prototype.onBeforeFirstTask = function(cb) {
        this.log('Sending newsletter to %s subscribers', this.subscribers.length);
        this.onStart();
        cb(null);
    };
    
    NewsletterSendJob.prototype.sendNewsletter = function(subscriber, cb) {
        var self = this;
        SiteService.getByUid(self.context.site, function (err, siteInfo) {
            if (util.isError(err)) {
                pb.log.error("SiteService: Failed to load site with getByUid. ERROR[%s]", err.stack);
                return cb(err, null);
            }
            var emailService = new pb.EmailService({site: self.context.site});
            emailService.getSettings(function (err, emailSettings) {
                if (util.isError(err)) {
                    pb.log.error("EmailService: Failed to load email settings. ERROR[%s]", err.stack);
                    return cb(err, null);
                }
                PluginService.getSettingsKV('newsletter-pencilblue', function (err, newsletterSettings) {
                    if (util.isError(err)) {
                        pb.log.error("PluginService: Failed to load newsletter settings. ERROR[%s]", err.stack);
                        return cb(err, null);
                    }
                    var options = {
                        from: newsletterSettings.newsletter_from_name + '<' + newsletterSettings.newsletter_from_address + '>',
                        to: subscriber,
                        subject: self.newsletter.subject
                    };
                    if (self.newsletter.use_template) {
                        options.template = 'email/newsletter';
                        options.replacements = {
                            styling: self.newsletter.styling,
                            layout: self.newsletter.layout
                        };
                        emailService.sendFromTemplate(options, cb);
                    } else {
                        options.layout = self.newsletter.layout;
                        emailService.sendFromLayout(options, cb);
                    }
                });
            });
        });
    };

    return NewsletterSendJob;
};
