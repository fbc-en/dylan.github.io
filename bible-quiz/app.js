function addHints(question){
  return  $('<a>').attr('target', '_blank')
    .attr('href','https://www.esv.org/'+ encodeURI(question.ref.book + ' ' + question.ref.chapter))
    .text(' Hints');
}

var all_questions = [{
    question_string: "How did King Saul meet his end?",
    ref: {
      book: '1 Chronicles',
      chapter: 10
    },
    choices: {
      correct: "He committed suicide",
      wrong: ["He was killed by Philistines", "He died of old age", "He was killed by one of his own men"]
    }
  }, {
    question_string: "Who was Solomon's mother?",
    ref:{
      book: '1 Kings',
      chapter: 1
    },
    choices: {
      correct: "Bathsheba",
      wrong: ["Hannah", "Rebecca", "Nancy"]
    }
  },
  {
      question_string: 'Who annointed Saul',
      ref:{
        book: '1 Samuel',
        chapter: 10
      },
      choices : {
          correct : 'Sammuel',
          wrong: ['Abraham', 'Moses', 'Adam']
      }
  }
];

  var Quiz = function() {
    this.questions = [];
  }
  
  Quiz.prototype.add_question = function(question) {
    this.questions.splice(Math.floor(Math.random() * this.questions.length), 0, question);
  }
  
  Quiz.prototype.render = function(container) {
    var self = this;
    
    $('#quiz-results').hide();
    
    var question_container = $('<div>').attr('id', 'question').insertAfter('#quiz-name');
    function change_question() {
      self.questions[current_question_index].render(question_container);
      $('#prev-question-button').prop('disabled', current_question_index === 0);
      $('#next-question-button').prop('disabled', current_question_index === self.questions.length - 1);
     
      $('#submit-button').prop('disabled', !self.questions.some(
          function(question){ return question.user_choice_index === null }));
    }
    
    var current_question_index = 0;
    change_question();
    
    $('#prev-question-button').click(function() {
      if (current_question_index > 0) {
        current_question_index--;
        change_question();
      }
    });
    
    $('#next-question-button').click(function() {
      if (current_question_index < self.questions.length - 1) {
        current_question_index++;
        change_question();
      }
    });
   
    $('#submit-button').click(function() {
      var score  = self.questions.map(function(item){
        return item.user_choice_index === item.correct_choice_index ? 1 : 0;
      }).reduce(function(accumulator, currentValue){
          return accumulator + currentValue
      });
      
      $('#quiz-retry-button').click(function() {
        window.location.reload()
     });
      
      var percentage = score / self.questions.length;

      var message = 'Maybe you should try a little harder.';
      if (percentage === 1) {
        message = 'Great job!'
      } else if (percentage >= .75) {
        message = 'You did alright.'
      } else if (percentage >= .5) {
        message = 'Better luck next time.'
      } 

      $('#quiz-results-message').text(message);
      $('#quiz-results-score').html('You got <b>' + score + '/' + self.questions.length + '</b> questions correct.');
      $('#quiz-results').slideDown();
      $('#submit-button').slideUp();
      $('#next-question-button').slideUp();
      $('#prev-question-button').slideUp();
      $('#quiz-retry-button').sideDown();
      
    });
    
    question_container.bind('user-select-change', function() {
      $('#submit-button').prop('disabled', self.questions.some(function(item){ return item.user_choice_index === null }));
    });
  }
  
  var Question = function(question_string, correct_choice, wrong_choices, ref) {
    this.question_string = question_string;
    this.choices = [];
    this.user_choice_index = null; 
    this.correct_choice_index = Math.floor(Math.random(0, wrong_choices.length + 1));
    this.ref = ref;
    
    var number_of_choices = wrong_choices.length + 1;
    for (var i = 0; i < number_of_choices; i++) {
      if (i === this.correct_choice_index) {
        this.choices[i] = correct_choice;
      } else {
        var wrong_choice_index = Math.floor(Math.random(0, wrong_choices.length));
        this.choices[i] = wrong_choices[wrong_choice_index];
        
        wrong_choices.splice(wrong_choice_index, 1);
      }
    }
  }
  
  Question.prototype.render = function(container) {
    var self = this;

    var question_string_h2;
    if (container.children('h2').length === 0) {
      question_string_h2 = $('<h2>').appendTo(container);
    } else {
      question_string_h2 = container.children('h2').first();
    }
    
    question_string_h2.text(this.question_string);

    addHints(self).appendTo(question_string_h2);

    if (container.children('input[type=radio]').length > 0) {
      container.children('input[type=radio]').each(function() {
        var radio_button_id = $(this).attr('id');
        $(this).remove();
        container.children('label[for=' + radio_button_id + ']').remove();
      });
    }
    for (var i = 0; i < this.choices.length; i++) {
      var choice_radio_button = $('<input>')
        .attr('id', 'choices-' + i)
        .attr('type', 'radio')
        .attr('name', 'choices')
        .attr('value', 'choices-' + i)
        .attr('checked', i === this.user_choice_index)
        .appendTo(container);
      
      var choice_label = $('<label>')
        .text(this.choices[i])
        .attr('for', 'choices-' + i)
        .appendTo(container);
    }
    
    $('input[name=choices]').change(function(index) {
      var selected_radio_button_value = $('input[name=choices]:checked').val();
      
      self.user_choice_index = parseInt(selected_radio_button_value.substr(selected_radio_button_value.length - 1, 1));
      
      container.trigger('user-select-change');
    });
  }
  
  $(document).ready(function() {
    var quiz = new Quiz();
    
    all_questions.forEach(function(item,i){
      quiz.add_question(new Question(all_questions[i].question_string, all_questions[i].choices.correct, all_questions[i].choices.wrong, all_questions[i].ref));
    });

    quiz.render($('#quiz'));
  });
