(function ($) {
	$(".toc").hide();

	// rex
	$(".toc-title").click(function () {
		$(".toc").toggle();
	});

	/* $("#toc").hover(function(){
		$(".toc").toggle();
	}); */
})(jQuery);