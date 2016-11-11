'use strict';

module.exports = function (pb) {

    //PB dependencies
    var util = pb.util;

    function NewsletterFormController() {}
    util.inherits(NewsletterFormController, pb.BaseAdminController);

    var SUB_NAV_KEY = 'new_newsletter';

    NewsletterFormController.prototype.render = function (cb) {
        var self = this;

        this.getMedia(function (err, media) {
            if (util.isError(err)) {
                return cb(err);
            }

            self.setPageName('New newsletter');
            self.ts.registerLocal('layout', new pb.TemplateValue('<div ng-bind-html="trust(previewLayout)"></div>', false));
            self.ts.registerLocal('styling', '');
            self.ts.registerLocal('angular_script', '');
            self.ts.registerLocal('angular_objects', new pb.TemplateValue(self.getAngularObjects(media), false));
            self.ts.load('admin/newsletters/newsletter_form', function (err, data) {
                if (err) {
                    return cb(err);
                }
                return cb({content: data});
            });
        });
    };

    NewsletterFormController.prototype.getAngularObjects = function (media) {
        var objects = {
            navigation: pb.AdminNavigation.get(this.session, ['newsletter', 'newsletter_new'], this.ls, this.site),
            pills: this.getAdminPills(SUB_NAV_KEY, this.ls, SUB_NAV_KEY),
            tabs: this.getTabs(),
            layout: '',
            newsletter: {use_template: true, styling: ''},
            media: media,
            siteKey: pb.SiteService.SITE_FIELD,
            site: this.site
        };
        return pb.ClientJs.getAngularObjects(objects);
    };
    
    NewsletterFormController.prototype.getMedia = function(cb) {
        var mediaService = new pb.MediaService(null, this.site, true);
        mediaService.get(cb);
    };

    NewsletterFormController.prototype.getTabs = function() {
        return [
            {
                active: 'active',
                href: '#content',
                icon: 'quote-left',
                title: this.ls.g('generic.CONTENT')
            },
            {
                href: '#media',
                icon: 'camera',
                title: this.ls.g('admin.MEDIA')
            },
            {
                href: '#preview',
                icon: 'eye',
                title: this.ls.g('generic.PREVIEW')
            }
        ];
    };

    NewsletterFormController.getSubNavItems = function (key, ls, subscriber) {
        return [
            {
                name: 'new_newsletter',
                title: '',
                icon: 'plus',
                href: '/admin/newsletter/new'
            }
        ];
    };

    NewsletterFormController.getRoutes = function (cb) {
        var routes = [
            {
                method: 'get',
                path: '/admin/newsletter/new',
                access_level: pb.SecurityService.ACCESS_WRITER,
                auth_required: true,
                content_type: 'text/html'
            }
        ];

        return cb(null, routes);
    };

    pb.AdminSubnavService.registerFor(SUB_NAV_KEY, NewsletterFormController.getSubNavItems);

    return NewsletterFormController;
};
