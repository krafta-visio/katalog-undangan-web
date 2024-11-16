(function() {
    function getParameterByName(name) {
        var url = window.location.href;
        name = name.replace(/[\[\]]/g, "\\$&");
        var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
            results = regex.exec(url);
        if (!results) return null;
        if (!results[2]) return '';
        return decodeURIComponent(results[2].replace(/\+/g, " "));
    }

    var nama_tamu = getParameterByName('tamu');
    nama_tamu = nama_tamu ? decodeURIComponent(nama_tamu) : "Tamu Undangan";

    function appendNamaTamu() {
        var namaTamuUndangan = $("#nama_tamu_undangan");
        if (namaTamuUndangan.length) {
            namaTamuUndangan.append(nama_tamu);
        } else {
            // Coba lagi jika elemen belum tersedia
            setTimeout(appendNamaTamu, 50);
        }
    }

    appendNamaTamu(); // Jalankan fungsi segera
})();
