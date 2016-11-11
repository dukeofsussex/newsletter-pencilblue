'use strict';

module.exports = function(pb) {

    //PB dependencies
    var util = pb.util;

    function ManageSubscribersController(){}
    util.inherits(ManageSubscribersController, pb.BaseAdminController);

    var SUB_NAV_KEY = 'manage_subscribers';

    ManageSubscribersController.prototype.render = function(cb) {
        var self = this;
        var angularObjects = pb.ClientJs.getAngularObjects({
            navigation: pb.AdminNavigation.get(self.session, ['newsletter', 'newsletter_subscribers'], self.ls, self.site),
            pills: self.getAdminPills(SUB_NAV_KEY, self.ls, SUB_NAV_KEY)
        });

        self.setPageName('Manage Subscribers');
        self.ts.registerLocal('angular_objects', new pb.TemplateValue(angularObjects, false));
        self.ts.load('admin/subscribers/manage_subscribers', function (err, data) {
            var result = data;
            cb({content: result});
        });
    };

    ManageSubscribersController.getSubNavItems = function(key, ls, data) {
        return [{
            name: 'manage_subscribers',
            title: 'Manage Subscribers',
            icon: 'refresh',
            href: '/admin/newsletter/subscribers'
        }, {
            name: 'new_subscriber',
            title: '',
            icon: 'plus',
            href: '/admin/newsletter/subscribers/new'
        }];
    };
    
    ManageSubscribersController.getRoutes = function(cb){
        var routes = [
            {
                method: 'get',
                path: '/admin/newsletter/subscribers',
                access_level: pb.SecurityService.ACCESS_WRITER,
                auth_required: true,
                inactive_site_access: true,
                content_type: 'text/html'
            }
        ];

        return cb(null, routes);
    };

    pb.AdminSubnavService.registerFor(SUB_NAV_KEY, ManageSubscribersController.getSubNavItems);

    return ManageSubscribersController;
};
