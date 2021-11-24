$(document).ready(function () {
	const btn_clear = $("#clear_form"),
		btn_generate = $("#generate_url"),
		utm_url = $("#utm_url"),
		utm_custom_params = $("#utm_custom_params"),
		utm_source = $("#utm_source"),
		utm_medium = $("#utm_medium"),
		utm_campaign = $("#utm_campaign"),
		utm_content = $("#utm_content"),
		utm_form = $("form#utm_form"),
		utm_table_container = $("#utm_table_container");

	btn_generate.on("click", function (e) {
		try {
			e.preventDefault();

			// clear previous
			utm_table_container.html(
				"<p>Click <code>Generate</code> above to build a list of URLs.</p>"
			);

			// can't use jQuery obj for reportValidity
			if (!document.querySelector("#utm_form").reportValidity()) {
				e.stopPropagation();
				throw new TypeError("invalid input");
			}

			utm_form.addClass("was-validated");
			console.log("valid input");

			let url = $("#utm_url_input").val().trim();

			// make url a URL obj
			url = new URL(url);

			// always ensure https://
			url.protocol = "https:";

			// select site based on entered url
			$(`input.sites[value="${url.origin}"]`).attr("checked", true);

			// @FIXME: if UTMs already in the url, use them (?)
			if (url.searchParams !== undefined) {
				if (url.searchParams.get("utm_campaign")) {
					utm_campaign.val(url.searchParams.get("utm_campaign"));
				}
				if (url.searchParams.get("utm_content")) {
					utm_content.val(url.searchParams.get("utm_content"));
				}
				if (url.searchParams.get("utm_source")) {
					utm_source.val(url.searchParams.get("utm_source"));
				}
				if (url.searchParams.get("utm_medium")) {
					utm_medium.val(url.searchParams.get("utm_medium"));
				}
			}

			create_utm(url, get_params(), get_selected_sites());
		} catch (e) {
			console.log(e);
		}
	});

	btn_clear.click(function () {
		utm_form.trigger("reset");
		utm_url_display.text("");
		btn_copy.hide();
	});

	// set utm_source to required if custom is shown
	utm_custom_params.on("shown.bs.collapse", function () {
		utm_source.attr("required", true);
	});

	utm_custom_params.on("hidden.bs.collapse", function () {
		utm_source.attr("required", false);
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

		if ("utm_instagram" in selected_sources) {
			selected_sources["utm_instagram"]["utm_medium"] = "social";
			selected_sources["utm_instagram"]["utm_source"] = "instagram";
			selected_sources["utm_instagram"]["icon"] = "bi-instagram";
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
			let utm_medium = clean_param($("#utm_medium")),
				utm_source = clean_param($("#utm_source"));

			if (utm_medium !== "")
				selected_sources["utm_custom"]["utm_medium"] = utm_medium;
			if (utm_source !== "")
				selected_sources["utm_custom"]["utm_source"] = utm_source;
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

		return selected_sites;
	}

	function create_utm(url, params, selected_sites) {
		try {
			// utm_source is always required
			if ("utm_custom" in params && params.utm_custom.source === "") {
				throw new ReferenceError("custom utm_source is required");
			}

			let utms = {};
			Object.assign(utms, selected_sites);

			// get each selected_site
			for (let [
				selected_sites_key,
				selected_sites_value,
			] of Object.entries(utms)) {
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

					// create URLSearchParams of each param
					utms[selected_sites_key][params_key].search =
						new URLSearchParams(params_value);
					utms[selected_sites_key][params_key].hash = url.hash;

					// console.log(utms[selected_sites_key][params_key].href);
				}
			}

			display_utms(utms, params);
		} catch (e) {
			console.log(e);
		}
	}

	function display_utms(utms, params) {
		utm_table_container.html("");

		for (let site of Object.values(utms)) {
			let site_html_id = site.hostname.replace(/\./g, "_"),
				site_table = $("<table>")
					.attr({
						id: site_html_id,
						"aria-labelledby": site_html_id + "_title",
					})
					.addClass(
						"table table-responsive table-hover caption-top align-top mb-4 mw-100"
					)
					.appendTo(utm_table_container);

			// create thead
			site_table
				.append(
					'<caption>Links for <span class="utm_url"></span></caption><thead class="table-dark"><tr><th scope="col" class="col-md-2">Source</th><th scope="col" class="col-md-8">UTM link</th><th scope="col" class="col-md-2">Short link</th></tr></thead>'
				)
				.before(
					`<hr class='my-4' /><h3 id="${site_html_id}_title">${site.hostname}</h3>`
				)
				.find(".utm_url")
				.html(
					`<a href="${site.href}" target="_blank">${site.href} <i class="bi-box-arrow-up-right"></i></a>`
				);

			for (let [source, values] of Object.entries(params)) {
				// console.log(`Generating ${source} for ${site.href}`);

				// @FIXME: sort for readability
				site[source].searchParams.sort();
				site[source].searchParams.delete("icon");

				// html friendly ID without .
				// pre#tcf_org_pk_utm_facebook
				let preId = `${site_html_id}_${source}`;

				// validate generated URL
				let validation = validate_utm(site[source]);

				// create tbody
				site_table.append(
					`<tbody><tr><th scope="row" class="p-md-3"><i class="bi ${values.icon} me-1" title="${source}"></i>${values.utm_source}</th><td><pre id="${preId}" class="border p-2 utm_display overflow-scroll w-100 text-dark bg-body"><code class="user-select-all"></code></pre>${validation}</td><td><pre id="${preId}_shortlink" class="border p-2 shortlink_display overflow-scroll w-100 text-dark bg-body"><code class="user-select-all"></code></pre><div class="d-block my-1"><button type="submit" class="btn btn-secondary btn generate_shorlink" aria-label="Generate short link" data-for="${preId}"><i class="bi-link"></i> Get short link</button></div></td></tr></tbody>`
				);

				// fill in generated UTM
				$(`pre#${preId} > code`).text(site[source].href);
			}
		}
	}

	utm_table_container.on("click", ".generate_shorlink", function (e) {
		e.preventDefault();
		shortenUrl(this);
	});

	function shortenUrl(btn) {
		const config = {
			token: process.env.BITLY_TOKEN, // Netlify env variable
			group_guid: "",
		};

		let $btn = $(btn),
			shortlink_for = $btn.attr("data-for"),
			url_display = $(`pre#${shortlink_for} > code`),
			url = new URL(url_display.text()),
			dataObject = {
				long_url: url,
				domain: "bit.ly",
				tags: ["bulk-utm-builder", "api"],
				group_guid: config.group_guid,
			};

		$btn.find("i").addClass("bi-arrow-clockwise spin").removeClass("bi-link");

		// @TODO: select group/domain based on domain
		if (url.hostname == "tcf.org.pk") {
			dataObject.domain = "link.tcf.org.pk";
		}

		fetch("https://api-ssl.bitly.com/v4/shorten", {
			method: "POST",
			headers: {
				Authorization: `Bearer ${config.token}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify(dataObject),
		})
			.then((response) => {
				$btn.find("i").removeClass("bi-arrow-clockwise spin").addClass("bi-link");

				if (response.ok) {
					return response.json();
				} else {
					return Promise.reject(response.status);
				}
			})
			.then((json) => {
				$(`pre#${shortlink_for}_shortlink code`).text(json.link);
			})
			.catch((err) => {
				console.log(err);
			});
	}

	function validate_utm(url) {
		let validate_message = [],
			utm_source = url.searchParams.get("utm_source"),
			utm_medium = url.searchParams.get("utm_medium"),
			utm_campaign = url.searchParams.get("utm_campaign"),
			utm_content = url.searchParams.get("utm_content");

		if (utm_source === null) {
			validate_message.push("<strong>utm_source</strong>");
		}
		if (utm_medium === null) {
			validate_message.push("<strong>utm_medium</strong>");
		}
		if (utm_campaign === null) {
			validate_message.push("<strong>utm_campaign</strong>");
		}
		if (utm_content === null) {
			validate_message.push("<strong>utm_content</strong>");
		}

		if (validate_message.length) {
			return `<div class="alert alert-warning d-flex align-items-top my-1" role="alert"><i class="bi bi-info-circle-fill me-3"></i><div>Consider adding ${validate_message.join(
				", "
			)}</div></div>`;
		}

		return "";
	}
});
