document.addEventListener('DOMContentLoaded', function() {
    loadCategoriesFromLocalStorage();
    loadVideosFromLocalStorage();
});

function showCategory(category) {
    var videosContainer = document.getElementById('videosContainer');
    var videos = JSON.parse(localStorage.getItem('videos')) || {};
    videosContainer.innerHTML = ''; // Limpa o conteúdo anterior

    if (videos[category]) {
        videos[category].forEach(function(url) {
            addVideoToGallery(category, url);
        });
    }
    videosContainer.classList.add('active');
}

document.getElementById('categoryForm').addEventListener('submit', function(event) {
    event.preventDefault();
    var newCategory = document.getElementById('newCategory').value.trim();
    if (newCategory && !categoryExists(newCategory)) {
        addCategory(newCategory);
        saveCategoryToLocalStorage(newCategory);
        document.getElementById('newCategory').value = '';
    }
});

document.getElementById('deleteCategoryForm').addEventListener('submit', function(event) {
    event.preventDefault();
    var categoryToDelete = document.getElementById('deleteCategory').value;
    if (categoryToDelete) {
        removeCategory(categoryToDelete);
        removeCategoryFromLocalStorage(categoryToDelete);
    }
});

document.getElementById('videoForm').addEventListener('submit', function(event) {
    event.preventDefault();
    var category = document.getElementById('category').value;
    var videoUrl = document.getElementById('videoUrl').value;
    if (category && videoUrl) {
        var embedUrl = convertToEmbedUrl(videoUrl);
        if (embedUrl && !videoExists(category, embedUrl)) {
            addVideoToGallery(category, embedUrl);
            saveVideoToLocalStorage(category, embedUrl);
            document.getElementById('category').value = '';
            document.getElementById('videoUrl').value = '';
        } else {
            alert('URL de vídeo inválida ou já existente. Por favor, insira uma URL válida do YouTube, Vimeo, ou uma URL direta de vídeo/imagem.');
        }
    }
});

function convertToEmbedUrl(url) {
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
        var videoId = url.split('v=')[1] || url.split('youtu.be/')[1];
        var ampersandPosition = videoId.indexOf('&');
        if (ampersandPosition !== -1) {
            videoId = videoId.substring(0, ampersandPosition);
        }
        return 'https://www.youtube.com/embed/' + videoId;
    } else if (url.includes('vimeo.com')) {
        var videoId = url.split('vimeo.com/')[1];
        return 'https://player.vimeo.com/video/' + videoId;
    } else if (url.match(/\.(jpeg|jpg|gif|png)$/) != null) {
        return url;
    } else if (url.match(/\.(mp4|webm|ogg)$/) != null) {
        return url;
    } else {
        return null;
    }
}

function addCategory(category) {
    var selectElements = document.querySelectorAll('select');
    selectElements.forEach(function(select) {
        var option = document.createElement('option');
        option.value = category;
        option.textContent = category.charAt(0).toUpperCase() + category.slice(1);
        select.appendChild(option);
    });

    var categoryLinks = document.getElementById('categoryLinks');
    var link = document.createElement('a');
    link.href = '#';
    link.textContent = category.charAt(0).toUpperCase() + category.slice(1);
    link.onclick = function() {
        showCategory(category);
    };
    categoryLinks.appendChild(link);
}

function removeCategory(category) {
    var selectElements = document.querySelectorAll('select');
    selectElements.forEach(function(select) {
        var options = select.options;
        for (var i = 0; i < options.length; i++) {
            if (options[i].value === category) {
                select.removeChild(options[i]);
                break;
            }
        }
    });

    var categoryLinks = document.getElementById('categoryLinks');
    var links = categoryLinks.getElementsByTagName('a');
    for (var i = 0; i < links.length; i++) {
        if (links[i].textContent.toLowerCase() === category.toLowerCase()) {
            categoryLinks.removeChild(links[i]);
            break;
        }
    }
}

function addVideoToGallery(category, embedUrl) {
    var videosContainer = document.getElementById('videosContainer');
    var videoDiv = document.createElement('div');
    videoDiv.classList.add('video');

    if (embedUrl.match(/\.(jpeg|jpg|gif|png)$/) != null) {
        var img = document.createElement('img');
        img.src = embedUrl;
        videoDiv.appendChild(img);
    } else if (embedUrl.match(/\.(mp4|webm|ogg)$/) != null) {
        var video = document.createElement('video');
        video.src = embedUrl;
        video.controls = true;
        videoDiv.appendChild(video);
    } else {
        var iframe = document.createElement('iframe');
        iframe.src = embedUrl;
        iframe.frameBorder = '0';
        iframe.allow = 'accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture';
        iframe.allowFullscreen = true;
        videoDiv.appendChild(iframe);
    }

    var deleteButton = document.createElement('button');
    deleteButton.textContent = 'X';
    deleteButton.classList.add('delete-button');
    deleteButton.onclick = function() {
        removeVideoFromGallery(category, embedUrl, videoDiv);
    };

    videoDiv.appendChild(deleteButton);
    videosContainer.appendChild(videoDiv);
}

function removeVideoFromGallery(category, embedUrl, videoDiv) {
    var videos = JSON.parse(localStorage.getItem('videos')) || {};
    if (videos[category]) {
        videos[category] = videos[category].filter(function(url) {
            return url !== embedUrl;
        });
        localStorage.setItem('videos', JSON.stringify(videos));
        videoDiv.parentNode.removeChild(videoDiv);
    }
}

function saveCategoryToLocalStorage(category) {
    var categories = JSON.parse(localStorage.getItem('categories')) || [];
    categories.push(category);
    localStorage.setItem('categories', JSON.stringify(categories));
}

function removeCategoryFromLocalStorage(category) {
    var categories = JSON.parse(localStorage.getItem('categories')) || [];
    categories = categories.filter(function(cat) {
        return cat !== category;
    });
    localStorage.setItem('categories', JSON.stringify(categories));

    var videos = JSON.parse(localStorage.getItem('videos')) || {};
    delete videos[category];
    localStorage.setItem('videos', JSON.stringify(videos));
}

function saveVideoToLocalStorage(category, embedUrl) {
    var videos = JSON.parse(localStorage.getItem('videos')) || {};
    if (!videos[category]) {
        videos[category] = [];
    }
    videos[category].push(embedUrl);
    localStorage.setItem('videos', JSON.stringify(videos));
}

function loadCategoriesFromLocalStorage() {
    var categories = JSON.parse(localStorage.getItem('categories')) || [];
    categories.forEach(function(category) {
        addCategory(category);
    });
}

function loadVideosFromLocalStorage() {
    var videos = JSON.parse(localStorage.getItem('videos')) || {};
    for (var category in videos) {
        if (videos.hasOwnProperty(category)) {
            videos[category].forEach(function(url) {
                addVideoToGallery(category, url);
            });
        }
    }
}

function categoryExists(category) {
    var categories = JSON.parse(localStorage.getItem('categories')) || [];
    return categories.includes(category);
}

function videoExists(category, embedUrl) {
    var videos = JSON.parse(localStorage.getItem('videos')) || {};
    return videos[category] && videos[category].includes(embedUrl);
}
