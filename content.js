'use strict';

const storage = JSON.parse(localStorage.getItem('eot')) || {};

addListeners();
run();

function addListeners() {
    const wrapperEl = document.getElementById('js-repo-pjax-container');
    const observer = new MutationObserver((mutations) => {
        if (mutations.length) {
            run();
        }
    });

    observer.observe(wrapperEl, { childList: true });
    wrapperEl.addEventListener('click', (event) => {
        if (event.target.classList.contains('js--eot-button')) {
            onButtonClicked(event.target);
        } else if (event.target.parentNode.classList.contains('js--eot-button')) {
            onButtonClicked(event.target.parentNode);
        }
    });
}

function run() {
    const timelineComments = document.querySelectorAll('.file.js-comment-container:not(.outdated-comment)');
    const detailsComments = document.querySelectorAll('.comment-holder.js-line-comments');

    [...timelineComments, ...detailsComments]
        .map(appendHeader)
        .map(setVisibility)
        .map(setCommentsNumber);
}

function appendHeader(elem) {
    const headerHtml = `
        <div class="text-right p-2 js--eot-toggle-header">
            <div class="btn btn-sm js--eot-button">
                <span class="js--eot-text"></span>
                <span class="counter js--eot-counter"></span>
            </div>
        </div>
     `;
    
    elem.insertAdjacentHTML('afterbegin', headerHtml);

    return elem;
}

function setVisibility(elem) {
    const id = elem.querySelector('.js-comment').id.replace('discussion_', '');
    const header = elem.querySelector('.js--eot-toggle-header');
    const btn = elem.querySelector('.js--eot-button');
    const cachedVisibility = storage[id] && storage[id].isActive;
    const cachedCommentsCount = storage[id] && storage[id].commentsCount;
    const noDiff = cachedCommentsCount === getCommentsNumber(elem) || !cachedCommentsCount;

    header.dataset.commentId = id;

    if (cachedVisibility) {
        header.classList.add('eot__hide');
        btn.classList.add('selected');
    } else {
        header.classList.remove('eot__hide');
        btn.classList.remove('selected');
    }

    if (noDiff) {
        btn.classList.add('btn-outline');
        elem.querySelector('.js--eot-text').innerText = '#eot';
    } else {
        btn.classList.add('btn-danger');
        elem.querySelector('.js--eot-text').innerText = '#nope';
    }

    return elem;
}

function setCommentsNumber(elem) {
    elem.querySelector('.js--eot-counter').innerText = `${getCommentsNumber(elem)}`;

    return elem;
}

function getCommentsNumber(elem) {
    return elem.querySelectorAll('.js-comment').length;
}

function onButtonClicked(target) {
    let header = target.parentNode;
    let isActive;

    target.classList.toggle('selected');

    isActive = target.classList.contains('selected');

    header.classList[isActive ? 'add' : 'remove']('eot__hide');

    storage[header.dataset.commentId] = {
        isActive,
        commentsCount: +header.querySelector('.js--eot-counter').innerText
    };

    localStorage.setItem('eot', JSON.stringify(storage));
}