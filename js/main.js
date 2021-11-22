$(document).ready(function () {
	const btn_clear = $("#clear_form"),
		btn_generate = $("#generate_url"),
		utm_url = $("#utm_url"),
		utm_form = $("form#utm_form"),
		utm_url_display = $(".utm_display");

	// btn_copy.hide();

	btn_generate.click(function (e) {
		e.preventDefault();

		// can't use jQuery obj for reportValidity
		document.querySelector("#utm_form").reportValidity();

		// clear previous
		utm_url_display.text("");

		let url = $("#utm_url_input").val().trim();
		create_utm(url, get_params(), get_selected_sites());
	});

	btn_clear.click(function () {
		utm_form.trigger("reset");
		utm_url_display.text("");
		btn_copy.hide();
	});

	/*
	copy.on("success", function () {
		btn_copy.find("i").attr("class", "bi-clipboard-check");
		setTimeout(() => {
			btn_copy.find("i").attr("class", "bi-clipboard-plus");
		}, 1000);
	});
	*/

	// trim and lowercase utm parameters
	// more complex serialization is handled by URL API
	function clean_param(param) {
		return param.val().toLowerCase().trim();
	}

	function get_params() {
		let selected_sources = {},
			utm_campaign = clean_param($("#utm_campaign")),
			utm_content = clean_param($("#utm_content")),
			utm_term = clean_param($("#utm_term"));

		// build array of selected params
		$(".selected_sources input:checked")
			.map(function (_, el) {
				selected_sources[$(el).val()] = {};
				if (utm_campaign !== "")
					selected_sources[$(el).val()]["utm_campaign"] =
						utm_campaign;
				if (utm_content !== "")
					selected_sources[$(el).val()]["utm_content"] = utm_content;
				if (utm_term !== "")
					selected_sources[$(el).val()]["utm_term"] = utm_term;
			})
			.get();

		if ("utm_facebook" in selected_sources) {
			selected_sources["utm_facebook"]["utm_medium"] = "social";
			selected_sources["utm_facebook"]["utm_source"] = "facebook";
			selected_sources["utm_facebook"]["icon"] = "bi-facebook";
		}

		if ("utm_twitter" in selected_sources) {
			selected_sources["utm_twitter"]["utm_medium"] = "social";
			selected_sources["utm_twitter"]["utm_source"] = "twitter";
			selected_sources["utm_twitter"]["icon"] = "bi-twitter";
		}

		if ("utm_linkedin" in selected_sources) {
			selected_sources["utm_linkedin"]["utm_medium"] = "social";
			selected_sources["utm_linkedin"]["utm_source"] = "linkedin";
			selected_sources["utm_linkedin"]["icon"] = "bi-linkedin";
		}

		if ("utm_email" in selected_sources) {
			selected_sources["utm_email"]["utm_medium"] = "newsletter";
			selected_sources["utm_email"]["utm_source"] = "email";
			selected_sources["utm_email"]["icon"] = "bi-envelope";
		}

		if ("utm_whatsapp" in selected_sources) {
			selected_sources["utm_whatsapp"]["utm_medium"] = "referral";
			selected_sources["utm_whatsapp"]["utm_source"] = "whatsapp";
			selected_sources["utm_whatsapp"]["icon"] = "bi-whatsapp";
		}

		// if also building custom params
		if ("utm_custom" in selected_sources) {
			selected_sources["utm_custom"]["utm_medium"] = clean_param(
				$("#utm_medium")
			);
			selected_sources["utm_custom"]["utm_source"] = clean_param(
				$("#utm_source")
			);
			selected_sources["utm_custom"]["icon"] = "bi-pencil-square";
		}

		return selected_sources;
	}

	function get_selected_sites() {
		let selected_sites = {};

		// build array URLs from selected sites
		$(".selected_sites input:checked")
			.map(function (_, el) {
				let u = new URL($(el).val());
				selected_sites[u.hostname] = u;
			})
			.get();
			
		// @TODO: if no sites selected set default from the url

		return selected_sites;
	}

	function create_utm(url, params, selected_sites) {
		try {
			
			// make url a URL obj
			url = new URL(url);
			
			// always ensure https://
			url.protocol = "https:";
			

			// utm_source is always required
			if ("utm_custom" in params && params.utm_custom.source === "") {
				throw new ReferenceError("custom utm_source is required");
			}

			let utms = {};
			Object.assign(utms, selected_sites);

			// get each selected_site
			for (let [selected_sites_key, selected_sites_value] of Object.entries(utms)) {
				// set entered pathname on each selected site
				selected_sites_value.pathname = url.pathname;
				selected_sites_value.hash = url.hash;

				// get each selected param
				for (let [params_key, params_value] of Object.entries(params)) {
					// create URLs for each params in each selected site using path from url and base of each selected_sites
					utms[selected_sites_key][params_key] = new URL(
						url.pathname,
						selected_sites_value.origin
					);

					// delete(params_value['icon']);

					// create URLSearchParams of each param
					utms[selected_sites_key][params_key].search = new URLSearchParams(params_value);
					utms[selected_sites_key][params_key].hash = url.hash;

					// console.log(utms[selected_sites_key][params_key].href);
				}
			}

			display_utms(utms, params);
		} catch (e) {
			console.log("Error on line " + e.lineNumber + ": " + e.message);
		}
	}

	function display_utms(utms, params) {
		let utm_table_container = $("#utm_table_container"),
			utm_table = $("#utm_table");

		utm_table_container.html("");

		for (let site of Object.values(utms)) {
			let site_html_id = site.hostname.replace(/\./g, "_"),
				site_table = $("<table>")
					.attr({
						"id": site_html_id,
						"aria-labelledby": site_html_id + "_title"
					})
					.addClass(
						"table table-responsive table-hover caption-top align-middle mb-4 mw-100"
					)
					.appendTo(utm_table_container);

			// create thead
			site_table
				.append(
					'<caption>Links for <span class="utm_url"></span></caption><thead class="table-dark"><tr><th scope="col" class="col-md-2">Source</th><th scope="col" class="col-md-10">UTM link</th></tr></thead>'
				)
				.before(`<h3 id="${site_html_id}_title">${site.hostname}</h3>`)
				.after("<hr class='my-4' />")
				.find(".utm_url")
				.html(
					`<a href="${site.href}" target="_blank">${site.href} <i class="bi-box-arrow-up-right"></i></a>`
				);

			for (let [source, values] of Object.entries(params)) {
				// console.log(`Generating ${source} for ${site.href}`);

				// @TODO: sort for readability
				site[source].searchParams.sort();
				
				// html friendly ID without .
				// pre#tcf_org_pk_utm_facebook
				let preId = `${site_html_id}_${source}`;
				
				// console.log(values[icon]);
				
				// create tbody
				site_table.append(
					`<tbody><tr><th scope="row"><i class="bi ${values.icon} me-1" title="${source}"></i>${values.utm_source}</th><td><div class="input-group"><pre id="${preId}" class="user-select-all border p-2 utm_display overflow-scroll w-100 text-dark bg-body"><code></code></pre></div></td></tr></tbody>`
					);
				
				site[source].searchParams.delete('icon');

				// fill in generated UTM
				$(`pre#${preId} > code`).text(site[source].href);
			}
		}
	}
});
