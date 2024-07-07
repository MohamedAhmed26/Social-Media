// Id post clicked
let idPostClicked = 0;
// Infinity scroll
let currentPage = 1;
let isLoading = false;
window.addEventListener('scroll', function () {
    if (isLoading) return;
    let scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
    let scrolledDistance = window.scrollY;
    if (scrolledDistance >= scrollableHeight - 1000 && currentPage < 30) {
        isLoading = true;
        currentPage++;
        getPosts(currentPage);
    }
});

// Active link clicked and Dark mode on
document.addEventListener("DOMContentLoaded", () => {
    let navUl = document.querySelectorAll(".navbar-nav");
    if (localStorage.getItem("darkMode") === "true") {
        document.body.classList.add("dark");
    }
    navUl.forEach((item) => {
        item.addEventListener("click", (eo) => {
            if (eo.target.classList.contains("nav-link")) {
                document.querySelector(".active")?.classList.remove("active");
                eo.target.classList.add("active");
            }
            if (eo.target.classList.contains("dark-modee")) {
                let body = document.querySelector("body");
                body.classList.toggle("dark");
                // Save dark mode state to localStorage
                localStorage.setItem("darkMode", body.classList.contains("dark"));
            }
        });
    });
});

// GET request for show posts
function getPosts(page) {
    axios({
        method: "get",
        url: `https://tarmeezacademy.com/api/v1/posts?limit=20&page=${page}`,
        responseType: "json",
    }).then(function (response) {
        let posts = response.data.data;
        for (post of posts) {
            var body = post.body;
            var postTitle = "";
            var image = post.image;
            var name = post.author.name;
            var username = post.author.username;
            var commentsCount = post.comments_count;
            var createdTime = post.created_at;
            var profileImage = post.author.profile_image;
            idManClicked = post.author.id
            if (body == null) {
                body = "Body not found";
            }
            if (post.title != null) {
                postTitle = post.title;
            }
            if (name == null) {
                name = "name not found";
            }
            if (Object.keys(profileImage).length == 0) {
                profileImage = `imgs/profile.png`;
            }
            var postHtml = ` <div class="post-box">
            <div class="info-man-post">
                <img class="profileImgMain" src="${profileImage}" onclick="postInfoClicked(${post.author.id})" style="border-radius:50%; height:50px;" />
                <div class="title-man-post" onclick="postInfoClicked(${post.author.id})">
                <h2>${name}</h2>
                <p>${createdTime}</p>
                </div>
            </div>
            <div class="postContentParent" onclick="postClicked(${post.id})">
            <img src="${image}" alt="" />
            <h3>${postTitle}</h3>
            <span>${body}</span>
            <div class="comments">
                <span><i class="fa-solid fa-chevron-down"></i> (${commentsCount}) Comments</span>
            </div>
            </div>
                </div>`;
            document.getElementsByClassName("post-boxes")[0].innerHTML += postHtml;
            // Show Points only in your posts
            if (JSON.parse(localStorage.getItem("user")).id == post.author.id) {
                var newSpan = document.createElement("span");
                newSpan.textContent = "..."
                newSpan.setAttribute("data-bs-target", "#points")
                newSpan.setAttribute("data-bs-toggle", "modal")
                newSpan.setAttribute("class", "points")
                newSpan.setAttribute("onclick", `postClickedGetId(${post.id})`)
                let lastElementBeforeSpan = document.querySelectorAll(".title-man-post");
                lastElementBeforeSpan.forEach(item => {
                    item.parentNode.insertBefore(newSpan, item.nextSibling);
                })
            }
            // console.log(post);
            setTimeout(() => {
                isLoading = false;
            }, 1000);
        }
    });
}
getPosts(currentPage);

modalBodyy.innerText = "wait the response";

// On login
function loginbtnclicked() {
    let userLoginInput = document.getElementsByClassName("user-login-input")[0].value;
    let passwordLoginInput = document.getElementsByClassName("password-login-input")[0].value;
    let params = {
        username: userLoginInput,
        password: passwordLoginInput,
    };
    axios.post("https://tarmeezacademy.com/api/v1/login", params)
        .then((response) => {
            randomHearts();
            modalBodyy.innerText = "You have been logged in successfully";
            btnLoginForm.setAttribute("data-bs-dismiss", "modal");
            console.log(response.data.user.profile_image);
            var token = response.data.token;
            let imgSrc = response.data.user.profile_image;
            if (Object.keys(imgSrc).length == 0) {
                imgSrc = `imgs/man.png`;
            }
            // Set info in local storage
            localStorage.setItem("token", token);
            localStorage.setItem("user", JSON.stringify(response.data.user));

            // Update UI after login
            updateUIOnLogin(userLoginInput, imgSrc);
        })
        .catch((error) => {
            // on click btn close on form doesn't hide form
            btnLoginForm.removeAttribute("data-bs-dismiss");
            modalBodyy.innerText = error.response.data.message;
        });
}

// Update profile info after login
function updateUIOnLogin(userLoginInput, imgSrc) {
    // Show info and log out button
    let parentBtnLoginAndLogout = document.getElementsByClassName("log-btn")[0];
    let media = window.matchMedia("(max-width:991px)");
    if (media.matches) {
        parentBtnLoginAndLogout.style.display = "block";
    }
    let infoAndLogout = `<div class="infoo">
        <img class="my-pic" style="border-radius:50%;" src="${imgSrc}" alt="" />
        <span class="name">${userLoginInput}</span>
        </div>
        <button type="button" onclick="logout()" data-bs-toggle="modal" data-bs-target="#staticBackdrop" id="logout" class="btn btn-outline-danger">Log out</button>`;
    parentBtnLoginAndLogout.innerHTML = infoAndLogout;

    // Show new post input
    let postsParent = document.querySelector("body > div.posts > div");
    var newPostElement = document.createElement("div");
    newPostElement.classList.add("create-new-post");
    newPostElement.setAttribute("data-bs-toggle", "modal")
    newPostElement.setAttribute("data-bs-target", "#createpost")
    let newPost = `
        <p>Write a new post</p>
        <i class="fa-solid fa-plus"></i>`;
    newPostElement.innerHTML = newPost;
    postsParent.insertAdjacentElement("afterbegin", newPostElement);

    // Update profile info in hamburger menu for small screens
    if (media.matches) {
        let info = document.getElementsByClassName("infoo")[0];
        let parentNav = document.getElementsByClassName("parent-nav")[0];
        let infoo = `<div class="infoo">
        <img class="my-pic" style="border-radius:50%;" src="${imgSrc}" alt="">
        <span class="name">${userLoginInput}</span>
        </div>
        <ul class="navbar-nav me-auto mb-2 mb-lg-0">
        <li class="nav-item">
        <a class="nav-link active" aria-current="page" href="#">Home</a>
        </li>
        <li class="nav-item">
        <a class="nav-link" href="#">Profile</a>
        </li>
        <li class="nav-item">
        <a class="nav-link" href="#">Dark mode</a>
        </li>
        </ul>
        <button id="logout" type="button" class="btn btn-outline-danger">Log out</button>`;
        info.remove();
        parentNav.innerHTML = infoo;
    }

    // Add hearts animation
    randomHearts();
}

// On Content loaded don't forget personal info
document.addEventListener("DOMContentLoaded", function () {
    // Check if user is logged in
    if (localStorage.getItem("token")) {
        let user = JSON.parse(localStorage.getItem("user"));
        let imgSrc = user.profile_image;
        let userLoginInput = user.username;
        // Update UI after login
        updateUIOnLogin(userLoginInput, imgSrc);
    }
});

// On Log out
function logout() {
    modalBodyy.innerText = "You have been successfully logged out";
    localStorage.clear();
    let parentBtnLoginAndLogout = document.getElementsByClassName("parent-nav")[0];
    let infoAndLogin = `<ul class="navbar-nav me-auto mb-2 mb-lg-0">
        <li class="nav-item">
            <a class="nav-link active" aria-current="page" href="#">Home</a>
        </li>
        <li class="nav-item">
            <a class="nav-link" href="#">Profile</a>
        </li>
        <li class="nav-item">
            <a class="nav-link dark-modee" href="#">Dark mode</a>
        </li>
    </ul>
    <div class="log-btn">
        <button type="button" class="btn btn-outline-success me-1" data-bs-toggle="modal" data-bs-target="#exampleModal">
            Log in
        </button>
        <button type="button" class="btn btn-outline-success" data-bs-toggle="modal" data-bs-target="#exampleModall">
            Register
        </button>
    </div>`;
    parentBtnLoginAndLogout.innerHTML = infoAndLogin;

    // Hide new post input
    let newPostElement = document.querySelector(".create-new-post");
    if (newPostElement) {
        newPostElement.style.display = "none";
    }
}

// Add hearts
function randomHearts() {
    let parentHeart = document.createElement("div");
    parentHeart.classList.add("parentHeart");
    let body = document.getElementsByTagName("body")[0];
    body.append(parentHeart);
    const createRandomHeart = setInterval(() => {
        const heart = document.createElement("div");
        heart.classList.add("heart");
        heart.innerHTML = "&#128151;";
        heart.style.left = `${Math.random() * 100}%`;
        heart.style.animationDuration = `${(Math.random() + 0.5) * 1.5}s   `;
        const heart2 = document.createElement("div");
        heart2.classList.add("heart");
        heart2.innerHTML = "&#128525;";
        heart2.style.left = `${Math.random() * 100}%`;
        heart2.style.animationDuration = `${(Math.random() + 0.5) * 1.5}s   `;
        parentHeart.append(heart);
        parentHeart.append(heart2);
    }, 50);
    setTimeout(() => {
        clearInterval(createRandomHeart);
    }, 2000);
    setTimeout(() => {
        parentHeart.remove();
    }, 5000);
}

modalBodyy.innerText = "wait the response";

// Sign up form
function signUpBtn() {
    let formData = new FormData();
    formData.append("username", document.getElementById("usernamee").value)
    formData.append("name", document.getElementById("name").value)
    formData.append("email", document.getElementById("email").value)
    formData.append("password", document.getElementById("password").value)
    formData.append("image", document.getElementById("imglogo").files[0])

    let headers = {
        "Content-Type": "multipart/form-data",
    }

    axios.post("https://tarmeezacademy.com/api/v1/register", formData, { "headers": headers, })
        .then((response) => {
            console.log(response)
            randomHearts();
            modalBodyy.innerText = "Your account has been created successfully";
            signupFormBtn.setAttribute("data-bs-dismiss", "modal");

        }).catch((error) => {
            // on click btn close on form doesn't hide form
            if (error) {
                signupFormBtn.removeAttribute("data-bs-dismiss");
            }
            // Print error in body
            modalBodyy.innerText = error.response.data.message;
        });
}
modalBodyy.innerText = "wait the response";

// Create post
function createPost() {
    if (localStorage.getItem("token")) {
        let title = document.getElementById("title").value;
        let description = document.getElementById("description").value;
        let imageFile = document.getElementById("imgpost").files[0];
        if (!title || !description || !imageFile) {
            modalBodyy.innerText = "Please fill in all fields and select an image.";
            return;
        }
        let formData = new FormData();
        formData.append("title", title);
        formData.append("body", description);
        formData.append("image", imageFile);
        let headers = {
            "Content-Type": "multipart/form-data",
            "authorization": `Bearer ${localStorage.getItem("token")}`,
        };
        axios.post("https://tarmeezacademy.com/api/v1/posts", formData, { headers })
            .then(() => {
                modalBodyy.innerText = "Your post has been published successfully";
                btncreatepost.setAttribute("data-bs-dismiss", "modal");
                location.reload()
            })
            .catch(error => {
                btncreatepost.removeAttribute("data-bs-dismiss");
                modalBodyy.innerText = error.response.data.message;
            });
    } else {
        modalBodyy.innerText = "You are not logged in. Please log in to create a post.";
    }
}
function postClicked(postId) {
    console.log(postId)
    location.href = `postDetails.html?postId=${postId}`
}
function postClickedGetId(id) {
    idPostClicked = id
}
function editpost() {
    let titleEdit = document.getElementById("titleEdit").value;
    let contentEdit = document.getElementById("contentEdit").value;
    let params = {
        "title": titleEdit,
        "body": contentEdit,
        "_method": "put"
    };
    let headers = {
        "authorization": `Bearer ${localStorage.getItem("token")}`
    };
    axios.put(`https://tarmeezacademy.com/api/v1/posts/${idPostClicked}`, params, { headers: headers })
        .then(() => {
            alert("Post updated successfully!");
            location.reload();
        })
        .catch((error) => {
            alert(error.response.data.message);
        });
}
function delPost() {
    let headers = {
        "authorization": `Bearer ${localStorage.getItem("token")}`
    }
    axios.delete(`https://tarmeezacademy.com/api/v1/posts/${idPostClicked}`, { headers: headers }).then(() => {
        alert("The post has been deleted")
        location.reload();
    }).catch((error) => {
        alert(error.response.data.message);
    })
}

function postInfoClicked(manId) {
    location.href = `profile.html?manId=${manId}`
}