'use strict';

module.exports = function NewsletterPluginModule(pb) {

    /**
     * SamplePlugin - A sample for exemplifying what the main module file should
     * look like.
     * @class SamplePlugin
     * @constructor
     */
    function NewsletterPlugin() {}

    /**
     * Called when the application is being installed for the first time.
     * @static
     * @method onInstallWithContext
     * @param {object} context
     * @param {string} context.site
     * @param {function} cb (Error, Boolean) A callback that must be called upon completion.
     * The result should be TRUE on success and FALSE on failure
     */
    NewsletterPlugin.onInstallWithContext = function (context, cb) {
        cb(null, true);
    };

    /**
     * Called when the application is uninstalling this plugin.  The plugin should
     * make every effort to clean up any plugin-specific DB items or any in function
     * overrides it makes.
     * @static
     * @method onUninstallWithContext
     * @param {object} context
     * @param {string} context.site
     * @param {function} cb (Error, Boolean) A callback that must be called upon completion.
     * The result should be TRUE on success and FALSE on failure
     */
    NewsletterPlugin.onUninstallWithContext = function (context, cb) {
        var site = pb.SiteService.getCurrentSite(context.site);

        // Remove newsletter nav
        pb.AdminNavigation.removeFromSite("newsletter", site);
        cb(null, true);
    };

    /**
     * Called when the application is starting up. The function is also called at
     * the end of a successful install. It is guaranteed that all core PB services
     * will be available including access to the core DB.
     * @static
     * @method onStartupWithContext
     * @param {object} context
     * @param {string} context.site
     * @param {function} cb (Error, Boolean) A callback that must be called upon completion.
     * The result should be TRUE on success and FALSE on failure
     */
    NewsletterPlugin.onStartupWithContext = function (context, cb) {

        /**
         * Example for hooking into the RequestHandler for custom control flow.  The context will also provide the site.
         * This means that for multi-site implementations where the plugin is installed on a per plugin basis the hook
         * should only be registered ONCE.  Otherwise it will execute multiple times causing performance to degrade
         * @param ctx {object}
         * @param {RequestHandler} ctx.requestHandler
         * @param {object} ctx.themeRoute
         * @param {function} (Error)
         */
//        pb.RequestHandler.on(pb.RequestHandler.THEME_ROUTE_RETIEVED, function (ctx, callback) {
//            //do what ever needs to be done.  Use the callback to continue normal control flow or don't if you need to do redirects
//            pb.log.debug('SamplePlugin: The request handler hook triggered for request: %s', ctx.requestHandler.url.path);
//            callback();
//        });
        
        /**
         * Newsletter nav
         */
        var site = pb.SiteService.getCurrentSite(context.site);
        pb.AdminNavigation.addToSite({
            id: "newsletter",
            title: "Newsletter",
            icon: "newspaper-o",
            href: "/admin/newsletter",
            access: pb.SecurityService.ACCESS_WRITER,
            children: [
                {
                    id: "newsletter_new",
                    title: "Create newsletter",
                    icon: "plus",
                    href: "/admin/newsletter/new",
                    access: pb.SecurityService.ACCESS_WRITER
                },
                {
                    id: "newsletter_subscribers",
                    title: "Subscribers",
                    icon: "users",
                    href: "/admin/newsletter/subscribers",
                    access: pb.SecurityService.ACCESS_WRITER
                }
            ]
        }, site);

        return cb(null, true);
    };

    /**
     * Called when the application is gracefully shutting down.  No guarantees are
     * provided for how much time will be provided the plugin to shut down or which
     * services will be available at shutdown
     * @static
     * @method onShutdown
     * @param {function} cb (Error, Boolean) A callback that must be called upon completion.
     * The result should be TRUE on success and FALSE on failure
     */
    NewsletterPlugin.onShutdown = function (cb) {
        cb(null, true);
    };

    //exports
    return NewsletterPlugin;
};