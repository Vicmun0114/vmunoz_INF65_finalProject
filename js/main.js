const createElemWithText = (element = "p", content = "", className) => {
    const newElem = document.createElement(element);
    if (className) {
        newElem.setAttribute("class", className);
    }
    newElem.textContent = content;
    return newElem;
};

const createSelectOptions = (data) => {
    if (!data) return;
    const newArr = [];
    for (const user of data) {
        const newOpt = document.createElement('option');
        newOpt.value = user.id;
        newOpt.textContent = user.name;
        newArr.push(newOpt);
    }
    return newArr;
};

const toggleCommentSection = (postId) => {
    if (!postId) {
        return;
    }
    const section = document.querySelector(`section[data-post-id="${postId}"]`);
    if (!section) {
        return null;
    }
    section.classList.toggle('hide');
    return section;
};

const toggleCommentButton = (postId) => {
    if (!postId) {
        return;
    }
    const btn = document.querySelector(`button[data-post-id="${postId}"]`);
    if (!btn) {
        return null;
    }
    btn.textContent = btn.textContent === "Show Comments"
        ? 'Hide Comments'
        : 'Show Comments';
    return btn;
};

const deleteChildElements = (parentElement) => {
    if (!(parentElement instanceof HTMLElement)) {
        return undefined;
    }
    let child = parentElement.lastElementChild;
    while (child) {
        parentElement.removeChild(child);
        child = parentElement.lastElementChild;
    }
    return parentElement;
};
const addButtonListeners = () => {
    const btns = document.querySelectorAll('main button');
    if (btns) {
        btns.forEach(button => {
            const postId = button.dataset.postId;
            button.addEventListener('click', (event) => {
                toggleComments(event, postId);
            });
        });
    }
    return btns;
};

const removeButtonListeners = () => {
    const btns = document.querySelectorAll('main button');
    btns.forEach(button => {
        const postId = button.dataset.postId;
        button.removeEventListener('click', (event));
    });
    return btns;
};

const createComments = (data) => {
    if (!data) {
        return;
    }
    const fragemnt = document.createDocumentFragment();
    data.forEach(comment => {
        const article = document.createElement('article');
        const h3 = createElemWithText('h3', comment.name);
        const para1 = createElemWithText('p', comment.body);
        const para2 = createElemWithText('p', `From: ${comment.email}`);
        article.append(h3, para1, para2);
        fragemnt.append(article);
    });
    return fragemnt;
};

const populateSelectMenu = (data) => {
    if (!data) {
        return;
    }
    const selectMenu = document.getElementById('selectMenu');
    const userData = createSelectOptions(data);
    userData.forEach(option => {
        selectMenu.append(option);
    });
    return selectMenu;
};

const getUsers = async () => {
    try {
        const response = await fetch('https://jsonplaceholder.typicode.com/users');
        if (!response) throw new Error('Fertch failed');
        return response.json();
    } catch (e) {
        console.error(e);
    }
};

const getUserPosts = async (userId) => {
    if (!userId) return;
    try {
        const response = await fetch(`https://jsonplaceholder.typicode.com/posts/?userId=${userId}`);
        if (!response) throw new Error('Failed to Fetch user ID');
        return await response.json();
    } catch (e) {
        console.error(e);
    }
};

const getUser = async (userId) => {
    if (!userId) return;
    try {
        const response = await fetch(`https://jsonplaceholder.typicode.com/users/${userId}`);
        if (!response) throw new Error('Failed to Fetch user ID');
        return await response.json();
    } catch (e) {
        console.error(e);
    }
};

const getPostComments = async (postId) => {
    if (!postId) return;
    try {
        const response = await fetch(`https://jsonplaceholder.typicode.com/comments?postId=${postId}`);
        if (!response) throw new Error('Failed to fetch post ID');
        return response.json();
    } catch (e) {
        console.error(e);
    }
};

const displayComments = async (postId) => {
    if (!postId) return;
    const section = document.createElement('section');
    // section.setAttribute(section.dataset.postId, postId);
    section.dataset.postId = postId;
    section.classList.add('comments');
    section.classList.add('hide');
    const comments = await getPostComments(postId);
    const fragment = createComments(comments);
    section.append(fragment);
    return section;
};

const createPosts = async (posts) => {
    if (!posts) return;
    const fragment = document.createDocumentFragment();
    // posts.forEach(async (post) => {
    for (const post of posts) {
        const article = document.createElement('article');
        const h2 = createElemWithText('h2', post.title);
        const p1 = createElemWithText('p', post.body);
        const p2 = createElemWithText('p', `Post ID: ${post.id}`);
        const author = await getUser(post.userId);
        const p3 = createElemWithText('p', `Author: ${author.name} with ${author.company.name}`);
        const p4 = createElemWithText('p', author.company.catchPhrase);
        const button = createElemWithText('button', 'Show Comments');
        button.dataset.postId = post.id;
        const section = await displayComments(post.id);
        article.append(h2, p1, p2, p3, p4, button, section);
        fragment.append(article);
    };
    return fragment;
};

const displayPosts = async (posts) => {
    const main = document.querySelector('main');
    const element = !posts
        ? createElemWithText('p', 'Select an Employee to display their posts.', "default-text")
        : await createPosts(posts);
    main.append(element);
    return element;
};

const toggleComments = (event, postId) => {
    if (!event) return;
    if (!postId) return;
    event.target.listener = true;
    const section = toggleCommentSection(postId);
    const button = toggleCommentButton(postId);
    return [section, button];
};

const refreshPosts = async (posts) => {
    if (!posts) return;
    const removeButtons = removeButtonListeners(posts);
    const main = document.querySelector('main');
    deleteChildElements(main);
    const fragment = await displayPosts(posts);
    const addButtons = addButtonListeners(posts);
    return [removeButtons, main, fragment, addButtons];
};

const selectMenuChangeEventHandler = async (event) => {
    if (!event) return;
    document.getElementById("selectMenu").disabled = true;
    const userId = event?.target?.value || 1;
    const posts = await getUserPosts(userId);
    const refreshPostsArray = await refreshPosts(posts);
    document.getElementById("selectMenu").disabled = false;
    return [userId, posts, refreshPostsArray];
};

const initPage = async () => {
    const users = await getUsers();
    const select = populateSelectMenu(users);
    return [users, select];
};

const initApp = async () => {
    await initPage();
    const selectMenu = document.getElementById('selectMenu');
    selectMenu.addEventListener('change', selectMenuChangeEventHandler);
};

document.addEventListener('DOMContentLoaded', initApp);