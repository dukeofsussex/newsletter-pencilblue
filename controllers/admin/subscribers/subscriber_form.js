'use strict';

module.exports = function (pb) {

    //PB dependencies
    var util = pb.util;

    function SubscriberFormController() {}
    util.inherits(SubscriberFormController, pb.BaseAdminController);

    var SUB_NAV_KEY = 'new_subscriber';

    SubscriberFormController.prototype.extendedInit = function(cb) {
        this.siteQueryService = new pb.SiteQueryService({site: this.site, onlyThisSite: true});
        this.settings = pb.SettingServiceFactory.getServiceBySite(this.site, true);
        this.subscriptionService = pb.PluginService.getService('SubscriptionService', 'newsletter-pencilblue', this.site);
        cb();
    };

    SubscriberFormController.prototype.render = function (cb) {
        var self = this;

        self.fetchSubscriber(function (err, subscriber) {
            if (util.isError(err)) {
                return cb(err);
            } else if (!subscriber) {
                return self.reqHandler.serve404();
            }

            self.setPageName(subscriber[pb.DAO.getIdField()] ? self.ls.g('generic.EDIT') + ' ' + subscriber.email : 'New subscriber');
            self.ts.registerLocal('angular_script', '');
            self.ts.registerLocal('angular_objects', new pb.TemplateValue(self.getAngularObjects(subscriber), false));
            self.ts.load('admin/subscribers/subscriber_form', function (err, data) {
                self.checkForFormRefill(data, function (err, newResult) {
                    if (util.isError(err)) {
                        pb.log.error('SubscriberForm.checkForFormRefill encountered an error. ERROR[%s]', err.stack);
                        return cb(err);
                    }
                    return cb({content: newResult});
                });
            });
        });
    };

    SubscriberFormController.prototype.getAngularObjects = function (subscriber) {
        var objects = {
            navigation: pb.AdminNavigation.get(this.session, ['newsletter', 'newsletter_subscribers'], this.ls, this.site),
            pills: this.getAdminPills(SUB_NAV_KEY, this.ls, SUB_NAV_KEY, subscriber),
            subscriber: subscriber,
            siteKey: pb.SiteService.SITE_FIELD,
            site: this.site
        };
        return pb.ClientJs.getAngularObjects(objects);
    };

    SubscriberFormController.getSubNavItems = function (key, ls, subscriber) {
        return [
            {
                name: 'manage_subscribers',
                title: subscriber[pb.DAO.getIdField()] ? ls.g('generic.EDIT') + ' ' + subscriber.email : ls.g('generic.NEW'),
                icon: 'chevron-left',
                href: '/admin/newsletter/subscribers'
            },
            {
                name: 'new_subscriber',
                title: '',
                icon: 'plus',
                href: '/admin/newsletter/subscribers/new'
            }
        ];
    };

    SubscriberFormController.prototype.fetchSubscriber = function (cb) {
        if (!pb.validation.isIdStr(this.pathVars.id, true)) {
            return cb(null, {});
        }
        this.siteQueryService.loadById(this.pathVars.id, this.subscriptionService.getCollectionType(), cb);
    };

    SubscriberFormController.getRoutes = function (cb) {
        var routes = [
            {
                method: 'get',
                path: '/admin/newsletter/subscribers/:id',
                access_level: pb.SecurityService.ACCESS_WRITER,
                auth_required: true,
                content_type: 'text/html'
            }
        ];

        return cb(null, routes);
    };

    pb.AdminSubnavService.registerFor(SUB_NAV_KEY, SubscriberFormController.getSubNavItems);

    return SubscriberFormController;
};
