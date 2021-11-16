function insertData(data) {
    $('input[name=utm_source]').val(data.source),
        $('input[name=utm_medium]').val(data.medium),
        $('input[name=utm_campaign]').val(data.campaign),
        $('input[name=utm_content]').val(data.content),
        $('input[name=utm_term]').val(data.term),
        $('small[for=utm_campaign]').text(data.markCampaign),
        $('small[for=utm_content]').text(data.markContent),
        $('small[for=utm_term]').text(data.markTerm)
}

function transliterateWord(word) {
    word = word.toLowerCase();
    var cyrillic = [
            'а',
            'б',
            'в',
            'г',
            'д',
            'ж',
            'е',
            'ё',
            'з',
            'и',
            'й',
            'к',
            'л',
            'м',
            'н',
            'о',
            'п',
            'р',
            'с',
            'т',
            'у',
            'ф',
            'х',
            'ц',
            'ч',
            'ш',
            'щ',
            'ы',
            'ь',
            'ъ',
            'э',
            'ю',
            'я',
            'і',
            'ї',
            'ґ',
            'č',
            'ћ',
            'ђ',
            'љ',
            'њ',
            'џ',
            'ј',
            'ć',
            'đ',
            'ž',
            'š',
            'ł',
            'ŭ',
            'ń',
            'ź',
            'ś'
        ],
        latin,
        letter;
    return ['a',
            'b',
            'v',
            'g',
            'd',
            'zh',
            'e',
            'e',
            'z',
            'i',
            'j',
            'k',
            'l',
            'm',
            'n',
            'o',
            'p',
            'r',
            's',
            't',
            'u',
            'f',
            'h',
            'c',
            'ch',
            'sh',
            'sch',
            'y',
            '_',
            '_',
            'e',
            'yu',
            'ya',
            'i',
            'ji',
            'g',
            'c',
            'h',
            'd',
            'lj',
            'nj',
            'dz',
            'j',
            'c',
            'd',
            'zh',
            'sh',
            'l',
            'u',
            'n',
            'z',
            's'
        ].forEach((function(element, index) {
            letter = new RegExp(cyrillic[index], 'g'),
                word = word.replace(letter, element)
        })),
        word.replace(/([#=?])/gi, '-')
}

function encodeWord(word) {
    return encodeURIComponent(word.toLowerCase()).replace(/%7B/g, '{').replace(/%7D/g, '}').replace(/%5B/g, '[').replace(/%5D/g, ']').replace(/%20/g, '+').replace(/%2B/g, '+').replace(/\*/g, '%2A')
}

function preparationWord(word) {
    return word = word.replace(/(&|\s)/gi, '+'),
        $('input[name=transliteCheckbox]').prop('checked') ? transliterateWord(word) : encodeWord(word)
}

function showResult() {
    var values = [],
        anchor = '',
        prefixURL = $('button#prefixURL').text().trim(),
        inputValue = '',
        url = '',
        result,
        matchValue;
    '' !== $('[name="utm_url"]').val().trim() ? ($('[for=utm]').each(
		(function(index) {
        if (inputValue = $(this).val().replace(/\b(https?|ftp|file):\/\//g, '').replace(/(\/)+/g, '/').trim(),
		$(this).val($(this).val().replace(/\b(https?|ftp|file):\/\//g, '')), 0 === index) {
            if ('' !== inputValue) {
                var ps = inputValue.split('#');
                ps.length > 1 && (inputValue = ps[0], anchor = ps[1]),
                    null !== (matchValue = (inputValue = prefixURL + inputValue).match(/\//g)) && matchValue.length <= 2 && (inputValue += '/'),
                    url = inputValue.indexOf('?') < 0 ? inputValue + '?' : '?' === inputValue.slice(-1) ? inputValue : '&' !== inputValue.slice(-1) ? inputValue + '&' : inputValue,
                    values.push(url)
            }
        } else '' !== inputValue && values.push($(this).attr('name') + '=' + preparationWord(inputValue));
        $('input#inputShortify').val(''),
            $('small#shortifyStat').fadeOut(0)
    })), result = values[0] + values.slice(1).join('&'), '' !== anchor && (result += '#' + anchor), $('input#inputResult').val(result.replace(/\+\+/g, '+'))) : $('input#inputResult').val('')
}

function shortifyBitly() {
    $('input#inputShortify').shortify({
        service: 'bitly',
        apikey: window.bitlyKey
    })
}

function shortifyIsgd() {
    $('input#inputShortify').shortify({
        service: 'isgd'
    })
}

function shortifyVgd() {
    $('input#inputShortify').shortify({
        service: 'vgd'
    })
}

function shortifyClck() {
    $('input#inputShortify').shortify({
        service: 'clck'
    })
}

function showInputInfo(nameInput, text) {
    $(nameInput).text(text).fadeIn(500).delay(2000).fadeOut(500)
}

function prefixToggle() {
    var $a = $('a[name=prefixURLDropDown]'),
        $b = $('button#prefixURL');
    'https://' === $b.text() ? ($b.text('http://'), $a.text('https://')) : ($b.text('https://'), $a.text('http://'))
}

function yourToggle() {
    insertData({
        source: '',
        medium: '',
        campaign: '',
        content: '',
        term: '',
        markCampaign: '',
        markContent: '',
        markTerm: ''
    })
}
window.bitlyKey = '86641b48a5976faea71d695fec68b617a91f9fad',
    $(document).ready((function() {
        $('[data-toggle=\'tooltip\']').tooltip(),
            $('input[for=utm]').keyup((function() {
                showResult()
            })),
            $('a[name=prefixURLDropDown]').click((function() {
                prefixToggle()
            })),
            $('a.dropdown-item').click((function() {
                showResult()
            })),
            $('div.form-check').click((function() {
                showResult()
            })),
            $('label.custom-control').click((function() {
                showResult()
            })),
            $('button.btn').click((function() {
                showResult()
            })),
            $('a[name=shortifyBitly]').click((function() {
                shortifyBitly()
            })),
            $('a[name=shortifyIsgd]').click((function() {
                shortifyIsgd()
            })),
            $('a[name=shortifyVgd]').click((function() {
                shortifyVgd()
            })),
            $('a[name=shortifyClck]').click((function() {
                shortifyClck()
            }));


        var clipboardBtn = $('button[data-clipboard-target=\'#inputResult\']');
        clipboardBtn.click((function() {
                '' !== $('#inputResult').val().trim() && showInputInfo('#inputResultInfo')
            })),
            clipboardBtn.prop('disabled', !0),
            $('[name="utm_url"]').on('input', (function() {
                var value;
                '' !== $(this).val().trim() ? clipboardBtn.prop('disabled', !1) : clipboardBtn.prop('disabled', !0)
            })),
            $('label#yourToggle').click((function() {
                yourToggle()
            })),
            $('label#yandexToggle').click((function() {
                yandexToggle()
            })),
            $('label#googleToggle').click((function() {
                googleToggle()
            })),
            $('label#vkToggle').click((function() {
                vkToggle()
            })),
            $('label#fbToggle').click((function() {
                fbToggle()
            })),
            $('label#mycomToggle').click((function() {
                mycomToggle()
            })),
            new Clipboard('.btn')
    }));


	function googleToggle()
	{
		insertData(
		{
			source: "google",
			medium: "cpc",
			campaign: "{network}",
			content: "{creative}",
			term: "{keyword}",
			markCampaign: "Google Adwords substitutes {network} with 'g' (Global search), 's' (Search partner) or 'd' (Display Network)",
			markContent: "Google Adwords substitutes {creative} with the ad ID",
			markTerm: "Google Adwords substitutes {keyword} with the keyword"
		});
		$("#googleTab").tab("show");
	}
	
	function fbToggle()
	{
		insertData(
		{
			source: "facebook",
			medium: "cpc",
			campaign: "promo",
			content: "",
			term: "",
			markCampaign: "",
			markContent: "",
			markTerm: ""
		});
	}