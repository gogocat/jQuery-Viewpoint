$(document).ready(function(){
	$(".item3").viewpoint({
		inView: function(element, currentState){
			console.log("inView ", element.text(), element, currentState);
			element.addClass("rubberBand").viewpoint("disable");
		},
		offView:function(element, currentState){
			console.log("outView item", element.text(), currentState);
			element.removeClass("rubberBand");
		},
		offTop:function(element, currentState){
			console.log("offTop item3");
		},
		offRight:function(element, currentState){
			console.log("offRight item3");
		},
		offBottom:function(element, currentState){
			console.log("offBottom item3");
		},
		offLeft:function(element, currentState){
			console.log("offLeft item3");
		}
	});
	
	$(".item4").viewpoint({
		scrollElement: ".scroller",
		contentPane: ".dummy-container",
		inView: function(element, currentState){
			console.log("inView item", element.text(), element, currentState);
			element.addClass("tada");
		},
		offView:function(element, currentState){
			console.log("outView ", element.text(), currentState);
			element.removeClass("tada");
		},
		offTop:function(element, currentState){
			console.log("offTop item4");
		},
		offRight:function(element, currentState){
			console.log("offRight item4");
		},
		offBottom:function(element, currentState){
			console.log("offBottom item4");
		},
		offLeft:function(element, currentState){
			console.log("offLeft item4");
		}
	});
});