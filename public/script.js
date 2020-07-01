var oldTotalPrice = document.getElementById("form").elements[0].value;

function AddHidden() {
	document.getElementById("percent5").classList.add("hidden");
	document.getElementById("eur20").classList.add("hidden");
}

function RemoveHidden() {
	document.getElementById("percent5").classList.remove("hidden");
	document.getElementById("eur20").classList.remove("hidden");
}

document.getElementById("percent20").addEventListener("click", function () {
	if (document.querySelector("#percent20:checked") !== null) {
		AddHidden();
		var newPrice = oldTotalPrice - (oldTotalPrice * 0.2);
		document.getElementById("newTotalPrice").value = newPrice.toFixed(2);
	} else {
		RemoveHidden();
		document.getElementById("newTotalPrice").value = oldTotalPrice;
	}
});

document.getElementById("percent5").addEventListener("click", function () {
	if (document.querySelector("#percent5:checked") !== null || document.querySelector("#eur20:checked") !== null) {
		document.getElementById("percent20").classList.add("hidden");
		if (document.querySelector("#eur20:checked") !== null & document.querySelector("#percent5:checked") !== null) {
			var newPrice = (oldTotalPrice - (oldTotalPrice * 0.05)) - 20;
			document.getElementById("newTotalPrice").value = newPrice.toFixed(2);
		} else if (document.querySelector("#percent5:checked") !== null) {
			var newPrice = oldTotalPrice - (oldTotalPrice * 0.05);
			document.getElementById("newTotalPrice").value = newPrice.toFixed(2);
		} else if (document.querySelector("#eur20:checked") !== null) {
			var newPrice = oldTotalPrice - 20;
			document.getElementById("newTotalPrice").value = newPrice.toFixed(2);
		}
	} else {
		document.getElementById("percent20").classList.remove("hidden");
		document.getElementById("newTotalPrice").value = oldTotalPrice;
	}
});

document.getElementById("eur20").addEventListener("click", function () {
	if (document.querySelector('#eur20:checked') !== null || document.querySelector("#percent5:checked") !== null) {
		document.getElementById("percent20").classList.add("hidden");
		if (document.querySelector("#eur20:checked") !== null & document.querySelector("#percent5:checked") !== null) {
			var newPrice = (oldTotalPrice - (oldTotalPrice * 0.05)) - 20;
			document.getElementById("newTotalPrice").value = newPrice.toFixed(2);
		} else if (document.querySelector("#percent5:checked") !== null) {
			var newPrice = oldTotalPrice - (oldTotalPrice * 0.05);
			document.getElementById("newTotalPrice").value = newPrice.toFixed(2);
		} else if (document.querySelector("#eur20:checked") !== null) {
			var newPrice = oldTotalPrice - 20;
			document.getElementById("newTotalPrice").value = newPrice.toFixed(2);
		}
	} else {
		document.getElementById("percent20").classList.remove("hidden");
		document.getElementById("newTotalPrice").value = oldTotalPrice;
	}
});

function SearchM() {
	var textProp = "textContent" in document ? "textContent" : "innerText";
	[].slice.call(document.querySelectorAll("li"), 0).forEach(function (item) {
		if (item[textProp].indexOf("Motion Sensor") > -1 & item[textProp].indexOf("Quantity: 2") > -1) {
			document.getElementById("motion").classList.remove("hidden");
		}
	});
}
SearchM();

function SearchS() {
	var textProp = "textContent" in document ? "textContent" : "innerText";
	[].slice.call(document.querySelectorAll("li"), 0).forEach(function (item) {
		if (item[textProp].indexOf("Smoke Sensor") > -1 & item[textProp].indexOf("Quantity: 1") > -1) {
			document.getElementById("smoke").classList.remove("hidden");
		}
	});
}
SearchS();