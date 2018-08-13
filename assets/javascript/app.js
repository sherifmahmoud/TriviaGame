var game = {
    numQuestions: 20,
    questions: [],//array of trivia questions
    secondsPerQuestion: 30,// in seconds
    currentQuestion: 0,//start with the first question
    secondsRemaining: 0,//seconds remaining for the current question
    numCorrectAnswers: 0,
    numWrongAnswers: 0,
    loadQuestions: function () {
        var queryURL = "https://opentdb.com/api.php?" + "amount=" + this.numQuestions + "&category=11&difficulty=easy&type=multiple";
        $.ajax({
            url: queryURL,
            method: "GET"
        }).then(function (response) {
            //fill the questions array
            for (var i = 0; i < response.results.length; i++) {
                var question = {
                    text: response.results[i].question,
                    correctAnswer: response.results[i].correct_answer,
                    incorrectAnswers: response.results[i].incorrect_answers,
                    shuffledAnswers: ["", "", "", ""],
                    shuffleAnswers: function () {
                        var allAnswers = [];//temp copy of all answers
                        allAnswers.push(this.correctAnswer);//first, push the correct answer
                        //then push the incorrect answers
                        for (var i = 0; i < this.incorrectAnswers.length; i++) {
                            allAnswers.push(this.incorrectAnswers[i]);
                        }
                        //shuffle answers
                        var indexes = [0, 1, 2, 3];
                        for (var i = 0; i < allAnswers.length; i++) {
                            //pick a new position for it from the indexes array
                            var index = Math.floor(Math.random() * indexes.length);
                            var newPosition = indexes[index];
                            this.shuffledAnswers[newPosition] = allAnswers[i];
                            indexes.splice(index, 1);//remove the chosen index from the indexes array to ensure it's not reused again
                        }
                    },
                };
                question.shuffleAnswers();
                game.questions.push(question);
            }
            console.log("Questions loaded!!");
        });//ajax
    },//loadQuestions
    resetGame: function () {
        this.questions = [];
        this.currentQuestion = 0;
        this.secondsRemaining = 30;
        this.numCorrectAnswers = 0;
        this.numWrongAnswers = 0;
        this.loadQuestions();
    },//resetGame
};
$(document).ready(function () {

    game.resetGame();
    var questionTimer;//to countdown time remaining for a question
    $('#start').click(function () {
        if (typeof (questionTimer) !== 'undefined') {
            clearInterval(questionTimer);
        }
        game.secondsRemaining = game.secondsPerQuestion;
        updateDisplayTimer();//update the page with remaining seconds
        //Display the question and multiple choices
        displayCurrentQuestion();
        //start the question timer
        var secondsRemaining = game.secondsPerQuestion;
        //start seconds Countdown  
        questionTimer = setInterval(timerHandler, 1000);
        $('#start').prop("disabled", true);
    });//end $('#start').click

    $('li').click(function (e) {
        var chosenAnswer = e.target.textContent;
        //if the right answer clicked
        var correctAnswer = game.questions[game.currentQuestion].correctAnswer;
        if (chosenAnswer.localeCompare(correctAnswer) === 0) {
            game.numCorrectAnswers++;
            //display Correct answer feedback
            displayCorrectFeedback(true);
            updateResultsDisplay();
        } else {
            game.numWrongAnswers++;
            displayCorrectFeedback(false);
        }
        game.secondsRemaining = game.secondsPerQuestion;
        moveToNextQuestion();
        updateDisplayTimer();
    });//end $(li).click
    function moveToNextQuestion() {
        //clear the timer
        clearInterval(questionTimer);
        //move to the next question
        game.currentQuestion++;
        //if we havent reached the end of the questions list
        if (game.currentQuestion < game.numQuestions) {
            console.log('Question ' + game.currentQuestion);
            displayCurrentQuestion();
            //start a new timer
            game.secondsRemaining = game.secondsPerQuestion;
            questionTimer = setInterval(timerHandler, 1000);
        } else {
            clearInterval(questionTimer);
            //show the results to the user
            updateResultsDisplay();
            //reset game
            $('#question').text('Click Start to Begin..');
            $('li').hide();
            game.resetGame();
            //redisplay the start button
            $('#start').prop("disabled", false);
        }
    }
    function updateDisplayTimer() {//update the page with remaining seconds
        $('#rem_seconds').text('' + game.secondsRemaining);
    }
    function displayCurrentQuestion() {
        //display the question text
        $('#question').html(game.questions[game.currentQuestion].text);
        //display choices
        $('#ans1').html(game.questions[game.currentQuestion].shuffledAnswers[0]);
        $('#ans2').html(game.questions[game.currentQuestion].shuffledAnswers[1]);
        $('#ans3').html(game.questions[game.currentQuestion].shuffledAnswers[2]);
        $('#ans4').html(game.questions[game.currentQuestion].shuffledAnswers[3]);
        $('li').show();
    }
    function updateResultsDisplay() {
        $('#correct_ans').text("" + game.numCorrectAnswers);
        $('#wrong_ans').text("" + game.numWrongAnswers);
        $('#total').text("" + (game.numCorrectAnswers + game.numWrongAnswers));
    }
    function displayCorrectFeedback(isCorrect) {
        if (isCorrect) {
            $('#result_img').attr('src', 'assets/images/correct2.png');
            $('#result_img').attr('alt', 'Correct');

        } else {
            $('#result_img').attr('src', 'assets/images/wrong2.png');
            $('#result_img').attr('alt', 'Wrong');
        }
    }
    function timerHandler() {
        game.secondsRemaining--;//decrement the seconds remaining..
        if (game.secondsRemaining === 0) {
            moveToNextQuestion();
        }
        updateDisplayTimer();//update the page with remaining seconds
    }
});//end ready function
