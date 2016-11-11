(function($){
    'use strict';

    var SETTINGS = {
        buttonStates: {
            loading: '<i class="fa fa-circle-o-notch fa-spin fa-fw"></i> Sending...',
            success: '<i class="fa fa-check"></i> Submitted',
            error: '<i class="fa fa-repeat"></i> Retry'
        },
        errorElement: 'span',
        errorClass: 'text-warning',
        rules: {
            email: {
                minlength: 5,
                maxlength: 25,
                required: true,
                email: true
            }
        },
        stateColors: {
            loading: 'default',
            success: 'success',
            error: 'danger'
        },
        url: '/api/newsletter/subscriptions'
    };

    var sendForm = function(form){
        var data = {
            email: $('#newsletterSignupField').val()
        };
        $.post(SETTINGS.url, data, function(response) {
            toggleFormState(form, 'success');
            setAlert(form, 'success', response.message);
        })
        .fail(function (response) {
            var jsonResponse = response.responseJSON;
            var message = 'Oh no, something went wrong :(';
            toggleSubmit(form);
            toggleFormState(form, 'error');
            if (jsonResponse && jsonResponse.validationErrors) {
                message = jsonResponse.validationErrors[0].message;
            } else if (jsonResponse && jsonResponse.message) {
                message = jsonResponse.message;
            }
            setAlert(form, 'error', message);
        });
    };

    var onErrorPlacement = function(error, element) {
        if(element.parent('.input-group').length) {
            error.insertAfter(element.parent());
        } else {
            error.insertAfter(element);
        }
    };
    
    var setAlert = function (form, state, message) {
        form.find('#alert').show();
        form.find('#alert').removeClass();
        form.find('#alert').addClass('text-center alert alert-' + SETTINGS.stateColors[state]).text(message);
    };
    
    var hideAlert = function (form) {
        form.find('#alert').hide();
    };

    var toggleSubmit = function(form){
        form.find('#signUpSubmit').prop('disabled', function(idx, value) { return !value; });
    };
    
    var toggleFormState = function (form, state) {
        form.find('#signUpSubmit').html(SETTINGS.buttonStates[state]);
        form.find('#signUpSubmit').removeClass();
        form.find('#signUpSubmit').addClass('btn btn-' + SETTINGS.stateColors[state]);
        form.find('div:nth-child(2)').first().removeClass();
        form.find('div:nth-child(2)').first().addClass('form-group has-feedback has-' + state);
    };

    var onSubmit = function(source){
        var form = $(source);
        hideAlert(form);
        toggleSubmit(form);
        toggleFormState(form, 'loading');
        sendForm(form);
    };

    $('#newsletterSignUp').validate({
        submitHandler: function(form) {
            onSubmit(form);
        },
        rules: SETTINGS.rules,
        errorElement: SETTINGS.errorElement,
        errorClass: SETTINGS.errorClass,
        errorPlacement: onErrorPlacement
    });
})(window.jQuery);
