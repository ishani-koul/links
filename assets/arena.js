// This allows us to process/render the descriptions, which are in Markdown!
// More about Markdown: https://en.wikipedia.org/wiki/Markdown
let markdownIt = document.createElement('script');
markdownIt.src = 'https://cdn.jsdelivr.net/npm/markdown-it@14.0.0/dist/markdown-it.min.js';
document.head.appendChild(markdownIt);

let channelSlug = 'seijaku';


// First, let’s lay out some *functions*, starting with our basic metadata:
let placeChannelInfo = (data) => {
	// Target some elements in your HTML:
	let channelTitle = document.getElementById('channel-title');
	let channelDescription = document.getElementById('channel-description');
	let channelCount = document.getElementById('channel-count');
	let channelLink = document.getElementById('channel-link');

	// Then set their content/attributes to our data:
	channelTitle.innerHTML = data.title;
	channelDescription.innerHTML = window.markdownit().render(data.metadata.description); // Converts Markdown → HTML
	channelCount.innerHTML = data.length;
	channelLink.href = `https://www.are.na/channel/${channelSlug}`
}


// Then our big function for specific-block-type rendering:
let renderBlock = (block) => {
	// To start, a shared `ul` where we’ll insert all our blocks
	let channelBlocks = document.getElementById('channel-blocks'); //added here

	// Links!
	if (block.class == 'Link') {
		let linkItem = `
			<li>
				<picture>
					<source media="(max-width: 428px)" srcset="${ block.image.thumb.url }">
					<source media="(max-width: 640px)" srcset="${ block.image.large.url }">
					<img src="${ block.image.original.url }">
				</picture>
				<p><a href="${ block.source.url }" target="_blank">Read More ↗</a></p>
			</li>
		`;
		channelBlocks.insertAdjacentHTML('beforeend', linkItem);
	}

	// Images!
	else if (block.class == 'Image') {
		let imageItem = 
			`
				<li>
					<img src="${ block.image.original.url }" alt="${ block.title }">
				</li>
			`
		channelBlocks.insertAdjacentHTML('beforeend', imageItem);
		// …up to you!
	}

	// Text!
	else if (block.class == 'Text') {
		let textItem = 
		`
			<li>
				<blockquote>${block.content_html}</blockquote>
			</li>
		`
		channelBlocks.insertAdjacentHTML('beforeend', textItem);
		// …up to you!
	}

	// Uploaded (not linked) media…
	else if (block.class == 'Attachment') {
		let attachment = block.attachment.content_type // Save us some repetition

		// Uploaded videos!
		if (attachment.includes('video')) {
			// …still up to you, but we’ll give you the `video` element:
			let videoItem =
				`
				<li>
					<video controls src="${ block.attachment.url }"></video>
				</li>
				`
			channelBlocks.insertAdjacentHTML('beforeend', videoItem)
			// More on video, like the `autoplay` attribute:
			// https://developer.mozilla.org/en-US/docs/Web/HTML/Element/video
		}

		// Uploaded PDFs!
		else if (attachment.includes('pdf')) {
			let pdfItem = 
		`
			<li>
				<a href="${block.attachment.url}" target="_blank">View PDF ↗</a>
				<embed src="${block.attachment.url}" type="application/pdf" width="100%" height="500px">
			</li>
		`
		channelBlocks.insertAdjacentHTML('beforeend', pdfItem);
			// …up to you!
		}

		// Uploaded audio!
		else if (attachment.includes('audio')) {
			let audioItem =
				`
				<li>
					<video controls src="${ block.attachment.url }"></video> 
				</li>
				`
			channelBlocks.insertAdjacentHTML('beforeend', audioItem)
			// Ask why video works and not audio tag here
		}
	}

	// Linked media…
	else if (block.class == 'Media') {
		let embed = block.embed.type

		// Linked video!
		if (embed.includes('video')) {
			// …still up to you, but here’s an example `iframe` element:
			let linkedVideoItem =
				`
				<li class="linked-video">
					${ block.embed.html }
				</li>
				`
			channelBlocks.insertAdjacentHTML('beforeend', linkedVideoItem)
			// More on iframe: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/iframe
		}

		// Linked audio!
		else if (embed.includes('rich')) {
			let linkedAudioItem =
			`
			<li class="linked-audio">
				${ block.embed.html }
			</li>
			`
			channelBlocks.insertAdjacentHTML('beforeend', linkedAudioItem);
			// …up to you!
		}
	}
}

// It‘s always good to credit your work:
let renderUser = (user, container) => { // You can have multiple arguments for a function!
	let userAddress =
		`
		<address>
			<img src="${ user.avatar_image.display }">
			<h3>${ user.first_name }</h3>
			<p><a href="https://are.na/${ user.slug }">Are.na profile ↗</a></p>
		</address>
		`
	container.insertAdjacentHTML('beforeend', userAddress)
}


// Now that we have said what we can do, go get the data:
fetch(`https://api.are.na/v2/channels/${channelSlug}?per=100`, { cache: 'no-store' })
	.then((response) => response.json())
	.then((data) => {
		// console.log(data)
		data.contents.reverse().forEach((block) => {
			renderBlock(block);
		});

		let channelUsers = document.getElementById('channel-users');
		data.collaborators.forEach((collaborator) => renderUser(collaborator, channelUsers));
		renderUser(data.user, channelUsers);
	});


// Function to check if an element is in the viewport
function isInViewport(element) {
	const rect = element.getBoundingClientRect();
	return (
	  (rect.top >= 0) &&
	  (rect.left >= 0) &&
	  (rect.bottom <= window.innerHeight) &&
	  (rect.right <= window.innerWidth)
	);
}

// Function to highlight elements on scroll and hide those outside the viewport
function highlightOnScroll() {
	// Get all list items (or the elements you want to highlight)
	const items = document.querySelectorAll('li');
	
	// Loop through each item and check if it's in the viewport
	items.forEach(item => {
	if (isInViewport(item)) {
		item.classList.add('highlight'); // Show the item
	} else {
		item.classList.remove('highlight'); // Hide the item
	}
	});
}

// Attach the function to the scroll event
window.addEventListener('scroll', highlightOnScroll);

// Get the filter button
const filterButton = document.getElementById("filter-button");
const filterPanel = document.getElementById("filter-panel");

// Get all filter options
const filterOptions = document.querySelectorAll(".filter-option");

// Get the channel blocks
const channelBlocks = document.getElementById("channel-blocks");

// Toggle
filterButton.addEventListener("click", () => {
    filterPanel.classList.toggle("show");
});

// Add event listeners to each filter option
filterOptions.forEach(option => {
	option.addEventListener("click", () => {
		const filterType = option.getAttribute("data-type");
		channelBlocks.classList.remove("video", "image", "text", "audio"); //Try show-hide

		if (filterType === "image") {
			channelBlocks.classList.add("image");
		} else if (filterType === "video") {
			channelBlocks.classList.add("video");
		} else if (filterType === "text") {
			channelBlocks.classList.add("text");
		} else if (filterType === "audio") {
			channelBlocks.classList.add("audio");
		}

		filterPanel.classList.remove("show");
	});
});


