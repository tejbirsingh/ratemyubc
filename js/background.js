debugger;
var target,
  instructors = [];

target = $x('/html/body/div[2]/div[4]/table[3]/tbody/tr/td[2]/a');
target.forEach(function(profElement, index){
  var name = profElement.innerText;
  var lastName = name.split(',')[0].toLowerCase().trim();
  var firstName = name.split(',')[1].toLowerCase().trim();
  var prof = {
    name: name,
    lastName: lastName,
    firstName: firstName,
    targetNum: index
  };

  instructors.push(prof);
})

profRatings(instructors);

//find by xpath
function $x(path) {
  var result = document.evaluate(path, document, null, XPathResult.ANY_TYPE, null);
  var xnodes = [];
  var xres;
  while(xres = result.iterateNext()){
    xnodes.push(xres);
  }

  return xnodes;
}

function profRatings(professors){

  for (var i = 0; i < professors.length; i++) {

    var searchUrl = ubcSearchUrl(professors[i].lastName);

    chrome.runtime.sendMessage({url: searchUrl, prof: professors[i]}, function (response) {

      var profResult = getProfResultFromSearch (response.result, response.prof);

      if(!profResult)
        return;

      response.prof.url = profPageUrl(profResult);

      chrome.runtime.sendMessage({url: response.prof.url, prof: response.prof}, function (response){
        
        var profRatings = professorRatings(response.result);

        var targetLink = $(target[response.prof.targetNum]).attr('href');
        var profDiv = '<a id="' + profRatings.profName.last + response.prof.targetNum + '" href="' + targetLink + '" target="_blank" data-toggle="popover">' +
          target[response.prof.targetNum].innerText + '</a>';

        target[response.prof.targetNum].outerHTML = profDiv;


        var nDiv = document.createElement('div');
        nDiv.className = 'ratingList';
        nDiv.innerHTML = '<a href="' + response.prof.url + '" target="_blank">' + profRatings.numRatings + '</a>';
        var qDiv = document.createElement('div');
        var gDiv = document.createElement('div');
        var hDiv = document.createElement('div');
        var cDiv = document.createElement('div');
        var eDiv = document.createElement('div');
        var qTitle = document.createElement('div');
        var gTitle = document.createElement('div');
        var hTitle = document.createElement('div');
        var cTitle = document.createElement('div');
        var eTitle = document.createElement('div');
        var qValue = document.createElement('div');
        var gValue = document.createElement('div');
        var hValue = document.createElement('div');
        var cValue = document.createElement('div');
        var eValue = document.createElement('div');

        qDiv.className = 'grade';
        qTitle.className = 'title';
        qValue.className = 'value';
        gDiv.className = 'grade';
        gTitle.className = 'title';
        gValue.className = 'value';
        hDiv.className = 'rating';
        hTitle.className = 'title';
        hValue.className = 'value';
        cDiv.className = 'rating';
        cTitle.className = 'title';
        cValue.className = 'value';
        eDiv.className = 'rating';
        eTitle.className = 'title';
        eValue.className = 'value';

        qTitle.innerText = 'Overall Quality';
        qValue.innerText = profRatings.quality;
        gTitle.innerText = 'Average Grade';
        gValue.innerText = profRatings.grade;
        hTitle.innerText = 'Helpfulness';
        hValue.innerText = profRatings.helpfulness;
        cTitle.innerText = 'Clarity';
        cValue.innerText = profRatings.clarity;
        eTitle.innerText = 'Easiness';
        eValue.innerText = profRatings.easiness;


        qTitle.appendChild(qValue);
        qDiv.appendChild(qTitle);
        gTitle.appendChild(gValue);
        gDiv.appendChild(gTitle);
        hTitle.appendChild(hValue);
        hDiv.appendChild(hTitle);
        cTitle.appendChild(cValue);
        cDiv.appendChild(cTitle);
        eTitle.appendChild(eValue);
        eDiv.appendChild(eTitle);

        var popoverElement = document.createElement('div');
        popoverElement.appendChild(qDiv);
        popoverElement.appendChild(gDiv);
        popoverElement.appendChild(hDiv);
        popoverElement.appendChild(cDiv);
        popoverElement.appendChild(eDiv);
        popoverElement.appendChild(nDiv);


        $('#' + profRatings.profName.last + response.prof.targetNum).each(function () {
          var $elem = $(this);
          $elem.popover({
            trigger: 'hover',
            html: true,
            container: $elem,
            title: profRatings.profName.first + ' ' + profRatings.profName.last,
            content: popoverElement,
            template: '<div class="popover size" role="tooltip"><div class="arrow"></div><h3 class="popover-title"></h3><div class="popover-content"></div></div>'
          });
        });



      });
    });
  }
}

function ubcSearchUrl(searchQuery) {
  return 'http://www.ratemyprofessors.com/search.jsp?queryBy=teacherName&schoolName=university+of+british+columbia+&queryoption=HEADER&query='
    + searchQuery + '&facetSearch=true';
}