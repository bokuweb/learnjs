'use strict';

function googleSignIn(googleUser) {
    console.log(googleUser)
    const id_token = googleUser.getAuthResponse().id_token;
    console.log(id_token)
    AWS.config.update({
        region: 'us-east-1',
        credentials: new AWS.CognitoIdentityCredentials({
            IdentityPoolId: learnjs.poolId,
            Logins: {
                'accounts.google.com': id_token
            }
        })
    });
    learnjs.awsRefresh().then(function (id) {
        learnjs.identify.resolve({
            id, email: googleUser.getBasicProfile().getEmail(),
            refresh,
        })
    })
}

function refresh() {
    return gapi.auth2.getAuthInstance().signIn({
        prompt: 'login'
    }).then(function (userUpdate) {
        var creds = AWS.config.credentials;
        var newToken = userUpdate.getAuthResponse().id_token;
        creds.params.Logins['accounts.google.com'] = newToken;
        return learnjs.awsRefresh();
    });
}

var learnjs = {
    poolId: 'us-east-1:76ffe9b4-bd81-4c47-955a-cf1826cf8fcd',
};
learnjs.problemView = function (data) {
    var problemNumber = parseInt(data, 10)
    var view = $('.templates .problem-view').clone();

    if (problemNumber < learnjs.problems.length) {
        var buttonItem = learnjs.template('skip-btn');
        buttonItem.find('a').attr('href', '#problem-' + (problemNumber + 1));

        $('.nav-list').append(buttonItem);
        view.bind('removingView', function () {
            buttonItem.remove();
        })
    }

    // var title = 'Problem #' + problemNumber + ' Coming soon!';
    // return $('<div class="problem-view">').text(title);
    var problemData = learnjs.problems[problemNumber - 1];
    var resultFlash = view.find('.result');
    function checkAnswer() {
        var answer = view.find('.answer').val();
        var test = problemData.code.replace('__', answer) + '; problem();';
        return eval(test);
    }

    function checkAnswerClick() {
        if (checkAnswer()) {
            var correctFlash = learnjs.buildCorrectFlash(problemNumber)
            learnjs.flashElement(resultFlash, correctFlash);
        } else {
            learnjs.flashElement(resultFlash, correctFlash);
        }
        return false;
    }

    view.find('.check-btn').click(checkAnswerClick);
    view.find('.title').text('Problem #' + problemNumber);
    learnjs.applyObject(problemData, view);
    return view;
}

learnjs.showView = function (hash) {
    var routes = {
        '#problem': learnjs.problemView,
        '#profile': learnjs.profileView,
        '': learnjs.landingView,
        '#': learnjs.landingView
    };
    var hashParts = hash.split('-');
    var viewFn = routes[hashParts[0]];
    if (viewFn) {
        $('.view-container').empty().append(viewFn(hashParts[1]));
    }

    learnjs.triggerEvent('removingView', []);
    $('.view-container').empty().append(viewFn(hashParts[1]))
};

learnjs.appOnReady = function () {
    window.onhashchange = function () {
        learnjs.showView(window.location.hash);
    };
    learnjs.showView(window.location.hash);
    learnjs.identify.done(learnjs.addProfileLink);
}

learnjs.problems = [
    {
        description: "What is truth?",
        code: "function problem() { return __; }"
    },
    {
        description: "Simple Math",
        code: "function problem() { return 42 === 6 * __; }"
    }
];

learnjs.applyObject = function (obj, elm) {
    for (var key in obj) {
        elm.find('[data-name="' + key + '"]').text(obj[key]);
    }
}

learnjs.flashElement = function (elm, content) {
    elm.fadeOut('fast', function () {
        elm.html(content);
        elm.fadeIn();
    })
}

learnjs.template = function (name) {
    return $('.templates .' + name).clone();
}

learnjs.buildCorrectFlash = function (problemNum) {
    var correctFlash = learnjs.template('correct-flash');
    console.log(correctFlash)
    console.log(correctFlash.find('a'))
    var link = correctFlash.find('a');
    console.log(link[0]);
    if (problemNum < learnjs.problems.length) {
        console.log('aaa')
        link.attr('href', '#problem-' + (problemNum + 1));
    } else {
        console.log('00a')
        link.attr('href', '');
        link.text('youre finished', '');
    }
    return correctFlash;

    // learnjs.flashElement(resultFlash, 'Correct!');
}

learnjs.landingView = function () {
    return learnjs.template('landing-view');
}

learnjs.triggerEvent = function (name, args) {
    $('.view-container>*').trigger(name, args)
}

learnjs.awsRefresh = function () {
    var deferred = new $.Deferred();
    AWS.config.credentials.refresh(function (e) {
        if (e) {
            deferred.reject(e);
        } else {
            deferred.resolve(AWS.config.credentials.identityId);
        }
    })
    return deferred.promise();
}

learnjs.identify = new $.Deferred();

learnjs.profileView = function () {
    var view = learnjs.template('profile-view');
    learnjs.identify.done(function (identify) {
        view.find('.email').text(identify.email);
    });
    return view;
}

learnjs.addProfileLink = function(profile) {
  var link = learnjs.template('profile-link');
  link.find('a').text(profile.email);
  $('.signin-bar').prepend(link);
}