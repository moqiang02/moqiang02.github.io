(function($) {
	$(".toc").hide();

/* 	$(".toc-title").click(function(){
		$(".toc").toggle();
	}); */
	
	$("#toc").hover(function(){
		$(".toc").toggle();
	});
})(jQuery);