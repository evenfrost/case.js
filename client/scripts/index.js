// (function () {
  
  var mainView = new View('main', {
    nodes: {
      paragraph: document.querySelector('p')
    }
  });

  console.log(mainView.nodes);

  // var title = new ViewElement('title');

  // console.log(title);

  // title.on('mousedown mouseup', function (event) {
  //   console.log(event.type);
  // });

// })();