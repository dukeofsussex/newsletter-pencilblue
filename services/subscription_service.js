'use strict';

module.exports = function(pb) {

    //pb dependencies
    var util = pb.util;
    var BaseObjectService = pb.BaseObjectService;
    var SecurityService = pb.SecurityService;

    function SubscriptionService(context) {
        if (!util.isObject(context)) {
            context = {};
        }
        context.type = TYPE;

        SubscriptionService.super_.call(this, context);
    }
    util.inherits(SubscriptionService, BaseObjectService);

    var TYPE = 'newsletter_subscriber';

    var SERVICE_NAME = 'SubscriptionService';

    var isAdmin = function (context) {
        return SecurityService.isAuthorized(context.session, 1);
    };

    SubscriptionService.format = function(context, cb) {
        var dto = context.data;
        dto.email = BaseObjectService.sanitize(dto.email);
        dto.verified = isAdmin(context) ? dto.verified : 0;
        cb(null);
    };

    SubscriptionService.merge = function(context, cb) {
        context.object.email = context.data.email;
        context.object.verified = context.data.verified;
        cb(null);
    };

    SubscriptionService.validate = function(context, cb) {
        var obj = context.data;
        var errors = context.validationErrors;
        if (!pb.ValidationService.isEmail(obj.email, true)) {
            errors.push(BaseObjectService.validationFailure('email', 'Invalid Email address', 400));
        }
        return cb(null);
    };

    SubscriptionService.onGetAll = function(context, cb) {
        cb(null);
    };

    SubscriptionService.onGet = function(context, cb) {
        cb(null);
    };

    SubscriptionService.beforeSave = function(context, cb) {
        var dao = new pb.DAO;
        if (!context.data[pb.DAO.getIdField()]) {
            dao.exists(context.type, {email: context.data.email}, function (err, exists) {
                if (err) {
                    return cb(err);
                } else if (exists) {
                    var error = new Error('This Email address has already been registered');
                    error.code = 400;
                    return cb(error);
                }
                return cb(null);
            });
        } else {
            return cb(null);
        }
    };

    SubscriptionService.afterSave = function(context, cb) {
        if (!isAdmin(context)) {
            var NLS = pb.PluginService.getService('NewsletterService', 'newsletter-pencilblue', this.site);
            var NewsletterService = new NLS(context);
            NewsletterService.sendConfirmationEmail(context.data, function (err) {
                if (err) {
                    return cb(err);
                }
                delete context.data.object_type;
                delete context.data._id;
                delete context.data.id;
                context.data.message = 'A confirmation email has been sent to: ' + context.data.email + '. Please visit the included link to finish the sign-up';
                return cb(null);
            });
        }
        return cb(null);
    };

    SubscriptionService.beforeDelete = function(context, cb) {
        cb(null);
    };

    SubscriptionService.afterDelete = function(context, cb) {
        cb(null);
    };

    SubscriptionService.init = function(cb) {
        pb.log.debug("SubscriptionService: Initialized");
        cb(null, true);
    };
    
    SubscriptionService.getName = function() {
        return SERVICE_NAME;
    };
    
    SubscriptionService.getCollectionType = function() {
        return TYPE;
    };

    //Event Registries - Sets the handlers as the call backs when events are triggered for the given collection
    BaseObjectService.on(TYPE + '.' + BaseObjectService.FORMAT, SubscriptionService.format);
    BaseObjectService.on(TYPE + '.' + BaseObjectService.MERGE, SubscriptionService.merge);
    BaseObjectService.on(TYPE + '.' + BaseObjectService.VALIDATE, SubscriptionService.validate);
    BaseObjectService.on(TYPE + '.' + BaseObjectService.GET, SubscriptionService.onGet);
    BaseObjectService.on(TYPE + '.' + BaseObjectService.GET_ALL, SubscriptionService.onGetAll);
    BaseObjectService.on(TYPE + '.' + BaseObjectService.BEFORE_SAVE, SubscriptionService.beforeSave);
    BaseObjectService.on(TYPE + '.' + BaseObjectService.AFTER_SAVE, SubscriptionService.afterSave);
    BaseObjectService.on(TYPE + '.' + BaseObjectService.BEFORE_DELETE, SubscriptionService.beforeDelete);
    BaseObjectService.on(TYPE + '.' + BaseObjectService.AFTER_DELETE, SubscriptionService.afterDelete);

    //exports
    return SubscriptionService;
};
