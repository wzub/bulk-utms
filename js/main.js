$(document).ready(function () {
	const btn_copy = $("#btn_copy"),
		btn_clear = $("#clear_form"),
		btn_generate = $("#generate_url"),
		copy = new ClipboardJS("#btn_copy"),
		utm_url_display = $("#utm_url_display");

	btn_copy.hide();

	btn_generate.click(function (e) {
		e.preventDefault();
		createUrl();
	});

	btn_clear.click(function () {
		$("#utm_form").trigger("reset");
		utm_url_display.text('');
		btn_copy.hide();
	});

	copy.on("success", function () {
		btn_copy.find("i").attr("class", "bi-clipboard-check");
		setTimeout(() => {
			btn_copy.find("i").attr("class", "bi-clipboard-plus");
		}, 1000);
	});
	
	// trim and lowercase utm parameters
	// more complex serialization is handled by URL API
	function getParam(param) {
		return param.val().toLowerCase().trim();
	}
	
	function createUrl() {
		try {
			// get and sanitize user's parameters
			let url = new URL($("#utm_url_input").val().trim()),
				params = {
					utm_campaign: getParam($("#utm_campaign")),
					source: getParam($("#utm_source")),
					medium: getParam($("#utm_medium")),
					utm_content: getParam($("#utm_content")),
				},
				selected_sites = {};

			// @TODO: if no sites selected set default from the url
			// $("input[value='https://" + url.hostname + "']").attr("checked", true);

			// build array URLs from selected sites
			$('.sites:checked').map(function(_, el) {
				let u = new URL($(el).val());
				selected_sites[u.hostname] = u;
			}).get();

			// console.log(Object.keys(selected_sites));
			
			// always ensure https://
			url.protocol = "https:";
			
			// utm_source is always required
			if (params.source === "") {
				throw new ReferenceError("utm_source is required");
			}
			
			// @TODO: smelly - trim empty params
			for (var key in params) {
				if (params[key] === "") {
					// console.log(key + " is blank");
					delete params[key];
				}
			}
			
			// construct url
			var utm_link = new URLSearchParams(params);
			url.search = utm_link.toString();
			
			// display
			// $("#utm_url_created").val(url.href);
			utm_url_display.text(url.href);
			btn_copy.show();
			
			// console.log("Protocol: " + url.protocol);
			// console.log("Path: " + url.pathname);
			// console.log("String: " + utm_link.toString());
			// console.log("URL: " + url);
		} catch (e) {
			console.log("Error on line " + e.lineNumber + ": " + e.message);
			btn_copy.hide();
		}
	}
	

	// hljs.highlightAll();
});