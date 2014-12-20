// (function () {
  
  var mainView = new View('main', {
    elements: {
      paragraph: document.querySelector('p')
    }
  });

  console.log(mainView.elements.paragraph);

  // var title = new ViewElement('title');

  // console.log(title);

  // title.on('mousedown mouseup', function (event) {
  //   console.log(event.type);
  // });

// })();