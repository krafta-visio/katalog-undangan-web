// Ambil Nama Tamu Undangan dari URL
function getParameterByName(name) {
    let url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    let regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results || !results[2]) return "Tamu Undangan";
    return decodeURIComponent(results[2].replace(/\+/g, " "))
        .replace(/-/g, " ")
        .replace(/\|/g, " / ")
        .replace(/ dan /gi, " & ");
}

$(document).ready(function () {
    $("#nama_tamu_undangan").append(getParameterByName('tamu'));
});

// Ambil URL API dari GitHub
let apiUrl = "";
function loadConfigUndangan(callback) {
    fetch("https://raw.githubusercontent.com/krafta-visio/app_assets/main/config-undangan-web.json")
        .then(response => response.json())
        .then(config => {
            apiUrl = config.apiUrl;
            console.log("API URL Loaded:", apiUrl);
            if (callback) callback();
        })
        .catch(error => console.error("Error fetching config:", error));
}

// Ambil Data Ucapan
function getDataUcapan() {
    if (!apiUrl) {
        console.error("API URL belum tersedia!");
        return;
    }
    let idClient = $("#ucapan-id").val();
    $.ajax({
        url: `${apiUrl}?action=readUcapan&idclient=${idClient}`,
        type: "GET",
        dataType: "json",
        success: function (data) {
            let divUcapan = $("#div-ucapan");
            divUcapan.empty();
            data.forEach(row => {
                divUcapan.append(
                    `<div class="mb-2" style="border-bottom:1px dotted #ccc"><strong>${row[2]}</strong>
                    <span class="text-muted" style="float: right; font-size:7pt;">${row[4]}</span>
                    <p><i>"${row[3]}"</i></p></div>`
                );
            });
        },
        error: function (error) {
            console.error("Error fetching data", error);
        }
    });
}

// Kirim Data Ucapan
function postDataUcapan() {
    if (!apiUrl) {
        console.error("API URL belum tersedia!");
        return;
    }

    let formattedDate = new Date().toLocaleDateString('id-ID');
    let d1 = $("#ucapan-id").val();
    let d2 = $("#ucapan-namalengkap").val().trim();
    let d3 = $("#ucapan-isiucapan").val().trim();

    // Validasi input
    if (!d2 || !d3) {
        alert("Nama lengkap dan isi ucapan harus diisi.");
        return;
    }

    fetch(`${apiUrl}?action=createUcapan&d1=${encodeURIComponent(d1)}&d2=${encodeURIComponent(d2)}&d3=${encodeURIComponent(d3)}&d4=${encodeURIComponent(formattedDate)}`)
        .then(response => response.text())
        .then(message => {
            alert(message);
            getDataUcapan();
        })
        .catch(error => console.error("Error posting data:", error));

    $("#ucapan-namalengkap, #ucapan-isiucapan").val("");
}

// Cek Form RSVP
function checkFormRSVP() {
    let nama = $("#nama_konfirmasi_kehadiran").val()?.trim() || "";
    let jumlah = $("#jumlah_konfirmasi_kehadiran").val()?.trim() || "";
    let kehadiran = $("input[name='info_konfirmasi_kehadiran']:checked").val();
    
    if (nama !== "" && jumlah !== "" && kehadiran !== undefined) {
        $("#simpanKonfirmasiKehadiran").removeClass("disabled").prop("disabled", false);
    } else {
        $("#simpanKonfirmasiKehadiran").addClass("disabled").prop("disabled", true);
    }
}

// Pastikan event binding untuk modal
$("#modalRSVP").on("shown.bs.modal", function () {
    checkFormRSVP();
});

$(document).on("input change", "#modalRSVP input", function () {
    checkFormRSVP();
});

// Kirim Data RSVP
function kirimKonfirmasiKehadiran() {
    if (!apiUrl) {
        console.error("API URL belum tersedia!");
        return;
    }

    let formattedDate = new Date().toLocaleDateString('id-ID');
    let d1 = $("#ucapan-id").val();
    let d2 = $("#nama_konfirmasi_kehadiran").val().trim();
    let d3 = $("input[name='info_konfirmasi_kehadiran']:checked").val();
    let d4 = $("#jumlah_konfirmasi_kehadiran").val().trim();

    // Validasi input
    if (!d2 || !d3 || !d4) {
        alert("Nama, konfirmasi kehadiran, dan jumlah tamu harus diisi.");
        return;
    }

    fetch(`${apiUrl}?action=createRSVP&d1=${encodeURIComponent(d1)}&d2=${encodeURIComponent(d2)}&d3=${encodeURIComponent(d3)}&d4=${encodeURIComponent(d4)}&d5=${encodeURIComponent(formattedDate)}`)
        .then(response => response.text())
        .then(alert)
        .catch(error => console.error("Error posting data:", error));

    $("#nama_konfirmasi_kehadiran, #jumlah_konfirmasi_kehadiran").val("");
}

// Jalankan Saat Dokumen Siap
$(document).ready(function () {
    loadConfigUndangan(() => {
        getDataUcapan();
    });

    $("#ucapan-btnkirim").click(function () {
        $(this).hide();
        $("#ucapan-namalengkap, #ucapan-isiucapan").hide();
        postDataUcapan();
    });

    $("#simpanKonfirmasiKehadiran").click(function () {
        $(this).hide();
        kirimKonfirmasiKehadiran();
        $(".btnKonfirmasiKehadiran").hide();
        $("#suksesKonfirmasiKehadiran").show();
		$("#modalRSVP").modal("hide");
    });
});







// FullScreen View (penting periksa ulang fungsi)
document.addEventListener('DOMContentLoaded', function() {
    var btnOpen = document.querySelector('.btnBukaUndangan');    
    if (btnOpen) {
        var originalOnClick = btnOpen.getAttribute('onclick');
        btnOpen.removeAttribute('onclick');
        btnOpen.addEventListener('click', function(e) {
            if (document.documentElement.requestFullscreen) {
                document.documentElement.requestFullscreen();
            } else if (document.documentElement.webkitRequestFullscreen) {
                document.documentElement.webkitRequestFullscreen();
            } else if (document.documentElement.msRequestFullscreen) {
                document.documentElement.msRequestFullscreen();
            } else if (document.documentElement.mozRequestFullScreen) {
                document.documentElement.mozRequestFullScreen();
            }
            if (originalOnClick) {
                eval(originalOnClick);
            }
        });
    }
});



// Fungsi untuk membuat jendela browser menjadi full mode
function toggleFullScreen() {
    if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen();
    } else if (document.documentElement.webkitRequestFullscreen) {
        document.documentElement.webkitRequestFullscreen();
    } else if (document.documentElement.msRequestFullscreen) {
        document.documentElement.msRequestFullscreen();
    } else if (document.documentElement.mozRequestFullScreen) {
        document.documentElement.mozRequestFullScreen();
    }
}