(function () {
  
  var mainView = new View('main');

  console.log(mainView.elements.title);

  mainView
    .select(['title', 'description'])
    .on('mouseup mousedown', function (event) {
      console.log(event.currentTarget);
    });

})();