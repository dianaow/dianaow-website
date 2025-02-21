<script>
  import { onMount } from 'svelte';

  onMount(() => {
    //document.addEventListener("DOMContentLoaded", function () {
        const videoPlaceholders = document.querySelectorAll(".video-container");
        console.log('videoPlaceholders', videoPlaceholders)
        const options = {
          root: null,
          rootMargin: "0px",
          threshold: 0.5 // Trigger when .video-container is 50% visible
        };

        const observer = new IntersectionObserver((entries, observer) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              // Use entry.target to access the element that triggered the intersection
              const videoPlaceholder = entry.target;

              const videoSrc = videoPlaceholder.getAttribute("data-src");

              const imgElement = videoPlaceholder.querySelector("img");
              videoPlaceholder.removeChild(imgElement)
              //imgElement.style.display = "none";

              const video = document.createElement("video");
              video.src = videoSrc;
              video.autoplay = true;
              video.loop = true;
              video.playsInline = true;
              video.muted = true;
              video.preload = "none";

              videoPlaceholder.appendChild(video);
              observer.unobserve(videoPlaceholder);
            }
          });
        }, options);

        videoPlaceholders.forEach((videoPlaceholder) => {
          observer.observe(videoPlaceholder);
        });
      });
  //});
</script>

<slot></slot>
