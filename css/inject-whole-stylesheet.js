/*
see docs: https://github.com/csswizardry/ct
*/
(function(){
	var ct = document.createElement('link');
	ct.rel = 'stylesheet';
	ct.href = 'https://csswizardry.com/ct/ct.css';
	ct.classList.add('ct');
	document.head.appendChild(ct);
}());