'use strict';

module.exports = function(pb) {

    //PB dependencies
    var util = pb.util;

    /**
     * BookApiController - A sample controller to demonstrate how to build an API on top of the BaseObjectService
     * @class BookApiController
     * @extends BaseApiController
     * @constructor
     */
    function NewsletterSubscriptionApiController(){}
    util.inherits(NewsletterSubscriptionApiController, pb.BaseApiController);

    /**
     * Called from BaseController#init, the function creates an instance of BookService
     * based on the current site and context.  The initSync is used to initialize the
     * controller synchronously
     * @method initSync
     * @param {object} context See BaseController#init
     */
    NewsletterSubscriptionApiController.prototype.initSync = function(/*context*/) {
        var SubscriptionService = pb.PluginService.getService('SubscriptionService', 'newsletter-pencilblue', this.site);

        this.service = new SubscriptionService(this.getServiceContext());
    };

    /**
     * Provides the routes that are to be handled by an instance of this prototype.
     * The route provides a definition of path, permissions, authentication, and
     * expected content type. In this particular case we are building a simple
     * API with no special CRUD operations.  Therefore, we can leverage the
     * power of the BaseApiController and let it do the heavy lifting for us.
     * All we have to do is define the routes.
     * Method is optional
     * Path is required
     * Permissions are optional
     * Access levels are optional
     * Content type is optional
     * @static
     * @method getRoutes
     * @param {function} cb (Error, Array)
     */
    NewsletterSubscriptionApiController.getRoutes = function(cb) {
        var routes = [
            {
                method: 'get',
                path: "/api/newsletter/subscriptions",
                auth_required: true,
                handler: "getAll",
                content_type: 'application/json'
            },
            {
                method: 'get',
                path: "/api/newsletter/subscriptions/:id",
                auth_required: true,
                handler: "get",
                content_type: 'application/json'
            },
            {
                method: 'put',
                path: "/api/newsletter/subscriptions/:id",
                auth_required: true,
                handler: "put",
                content_type: 'application/json',
                request_body: ['application/json', 'application/x-www-form-urlencoded', 'multipart/form-data']
            },
            {
                method: 'post',
                path: "/api/newsletter/subscriptions",
                auth_required: false,
                handler: "post",
                content_type: 'application/json',
                request_body: ['application/json', 'application/x-www-form-urlencoded', 'multipart/form-data']
            },
            {
                method: 'delete',
                path: "/api/newsletter/subscriptions/:id",
                auth_required: true,
                handler: "delete",
                content_type: 'application/json'
            }
        ];
        cb(null, routes);
    };

    //exports
    return NewsletterSubscriptionApiController;
};
