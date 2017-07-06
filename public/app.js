'use strict';

var learnjs = {};
learnjs.problemView = function (data) {
    var problemNumber = parseInt(data, 10)
    var view = $('.templates .problem-view').clone();

    if (problemNumber < learnjs.problems.length) {
        var buttonItem = learnjs.template('skip-btn');
        buttonItem.find('a').attr('href', '#problem-' + (problemNumber + 1));

        $('.nav-list').append(buttonItem);
        view.bind('removingView', function() {
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

learnjs.landingView = function(){
    return learnjs.template('landing-view');
}

learnjs.triggerEvent = function(name, args){
$('.view-container>*').trigger(name, args)
}