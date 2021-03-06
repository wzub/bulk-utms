$(document).ready(function () {
	const btn_clear = $("#clear_form"),
		btn_generate = $("#generate_url"),
		utm_custom_params = $("#utm_custom_params"),
		utm_source = $("#utm_source"),
		utm_medium = $("#utm_medium"),
		utm_campaign = $("#utm_campaign"),
		utm_content = $("#utm_content"),
		utm_form = $("form#utm_form"),
		utm_table_container = $("#utm_table_container"),
		btn_download = $("#download_csv"),
		form_edited_notice = $("#form_edited_notice").remove(),
		default_notice = $("#default_notice");

	btn_generate.on("click", function (e) {
		try {
			e.preventDefault();

			// clear previous stuff from the table
			cleanup();

			// can't use jQuery obj for reportValidity
			if (!document.querySelector("#utm_form").reportValidity()) {
				e.stopPropagation();
				throw new TypeError("invalid input");
			}

			utm_form.addClass("was-validated");

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
			
			btn_download.removeClass("d-none");
		} catch (e) {
			console.log(e);
		}
	});

	// set utm_source to required if custom is shown
	utm_custom_params.on("shown.bs.collapse", function () {
		utm_source.attr("required", true);
	});

	utm_custom_params.on("hidden.bs.collapse", function () {
		utm_source.attr("required", false);
	});

	btn_download.on("click", function () {
		let utm_table = $("table.utm_table");
		download_table_as_csv(utm_table);
	});

	btn_clear.on("click", () => cleanup(true));

	utm_form.on("change", function() {
		this.classList.add("form_edited");
		utm_table_container.prepend(form_edited_notice);
	});

	// add listener to container because copy buttons are dynamic
	utm_table_container.on("click", ".copy-url", function () {
		let btn_icon = this.querySelector("i"),
			btn_text = this.querySelector("span"),
			url_container = utm_table_container.find(`#${this.dataset.for}`);

		navigator.clipboard
			.writeText(url_container.text())
			.then(() => {
				btn_text.textContent = "Copied!";
				btn_icon.classList.replace("bi-clipboard-plus", "bi-clipboard-check");
				
				setTimeout(() => {
					btn_text.textContent = "Copy";
					btn_icon.classList.replace("bi-clipboard-check", "bi-clipboard-plus");
				}, 1000);

				console.log(`Copied ${url_container.text()}`);
			})
			.catch((err) => {
				console.log("Couldn't copy", err);
			});
		
		url_container.trigger("click");
	});

	// @Calumah via https://stackoverflow.com/questions/15547198/export-html-table-to-csv-using-vanilla-javascript
	function download_table_as_csv(table) {
		let rows = table.find("tr"),
			csv = [];

		// loop through all tr
		for (var i = 0; i < rows.length; i++) {
			// for each row get source and links inside pre
			let row = [],
				cols = rows[i].querySelectorAll("th, td pre");

			// loop through columns
			for (var j = 0; j < cols.length; j++) {
				// get and clean text of each th, td pre
				// remove multiple spaces and jumpline (break csv)
				// Escape double-quote with double-double-quote (see https://stackoverflow.com/questions/17808511/properly-escape-a-double-quote-in-csv)
				let data = cols[j].innerText
					.replace(/(\r\n|\n|\r)/gm, "")
					.replace(/(\s\s)/gm, " ")
					.replace(/"/g, '""');

				row.push('"' + data + '"');
			}
			csv.push(row.join(","));
		}

		// convert csv to a set and back again to remove duplicate table headers
		let csv_deduped = Array.from(new Set(csv)),
			csv_string = csv_deduped.join("\n"),
			filename = "utms_" + new Date().toLocaleDateString() + ".csv",
			link = document.createElement("a");

		link.style.display = "none";
		link.setAttribute("target", "_blank");
		link.setAttribute(
			"href",
			"data:text/csv;charset=utf-8," + encodeURIComponent(csv_string)
		);
		link.setAttribute("download", filename);
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	}

	// trim and lowercase utm parameters
	// more complex serialization is handled by URL API
	function clean_param(param) {
		return param.val().toLowerCase().trim();
	}

	function cleanup(clearForm = false) {
		if (clearForm) utm_form.trigger("reset").removeClass("was-validated");

		btn_download.addClass("d-none");
		utm_table_container.html(default_notice);
		utm_form.removeClass("form_edited");
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
						"table table-responsive table-hover caption-top align-top mb-4 mw-100 utm_table"
					)
					.appendTo(utm_table_container);

			// create thead
			// prettier-ignore
			site_table
				.append(
					`<caption>Links for <span class="utm_url"></span></caption>
					<thead class="table-dark">
						<tr>
							<th scope="col" class="col-md-2">Source</th>
							<th scope="col" class="col-md-7">UTM link</th>
							<th scope="col" class="col-md-3">Short link</th>
						</tr>
					</thead>`
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
				// validate generated URL
				let preId = `${site_html_id}_${source}`,
					validation = validate_utm(site[source]);

				// create tbody
				// prettier-ignore
				site_table.append(
					`<tbody>
					<tr>
						<th scope="row" class="p-md-3 text-capitalize"><i class="bi ${values.icon} me-1" title="${source}"></i>${values.utm_source}</th>
						<td class="position-relative">
							<pre id="${preId}" class="border p-2 utm_display text-dark bg-body text-break mb-1"><code class="user-select-all">${site[source].href}</code></pre>
							<button type="button" class="btn btn-outline-secondary copy-url col-auto" data-for="${preId}" title="Copy full URL"><i class="bi-clipboard-plus"></i> <span>Copy</span></button>
							${validation}
						</td>
						<td>
							<pre id="${preId}_shortlink" class="border p-2 shortlink_display text-dark bg-body text-break mb-1"><code class="user-select-all"></code></pre>
							<div class="btn-group" role="group">
								<button type="submit" class="btn btn-outline-secondary generate_shorlink col-auto ms-auto" aria-label="Generate short link" data-for="${preId}" title="Make short link"><i class="bi-lightning-charge-fill"></i> Make</button>
								<button type="button" class="btn btn-outline-secondary copy-url col-auto" data-for="${preId}_shortlink" title="Copy shortlink"><i class="bi-clipboard-plus"></i> <span>Copy</span></button>
							</div>
						</td>
					</tr>
					</tbody>`
				);

			}
		}
	}

	utm_table_container.on("click", ".generate_shorlink", function (e) {
		e.preventDefault();
		shortenUrl(this);
	});

	function shortenUrl(btn) {
		const config = {
			token: BITLY_TOKEN, // Netlify env variable
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

		$btn.find("i")
			.addClass("spinner-border spinner-border-sm")
			.removeClass("bi-link");

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
				$btn.find("i")
					.removeClass("spinner-border spinner-border-sm")
					.addClass("bi-link");

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

		// prettier-ignore
		if (validate_message.length) {
			return `
				<div class="alert alert-warning d-flex align-items-top my-1" role="alert">
					<i class="bi bi-info-circle-fill me-3"></i>
					<div>Consider adding ${validate_message.join(", ")}</div>
				</div>`;
		}

		return "";
	}
});
