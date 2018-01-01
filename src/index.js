
import VtexWishlist from './class/VtexWishlist.js';

// /buscapagina?fq=productId:10001,productId:10002,productId:10003&PS=3&sl=19ccd66b-b568-43cb-a106-b52f9796f5cd&cc=1&sm=0&sc=1&PageNumber=1

if ( typeof (window.VtexWishlist) === 'undefined' ) {
    window.VtexWishlist = VtexWishlist;
}

document.addEventListener('DOMContentLoaded', () => {
    new VtexWishlist({
        storeName: 'mob', // Nome da url da loja (required)
        wishlistEntity: 'WL', // Entidade de dados (required)
        shelfId: '2d5c05cd-75d7-42aa-b9b3-c4824ac2063a', // Id da vitrine que renderizará os elementos (required)
        appendTo: '.js--wishlist-items', // Classe do elemento que receberá os resultados (default)
        loaderClass: 'has--wishlist-loader', // (default)
        activeClass: 'is--active', // (default)
        linkTitle: {
            add: 'Adicionar a wishlist',
            remove: 'Remover da wishlist',
        },
        notFound: function() { return '<div class="wishlist__not-found">Nenhum produto em sua lista</div>'; }, // Element to append if no results (default)
    });
});
