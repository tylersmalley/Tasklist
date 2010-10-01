var Tasklist = { };

// Lists

var sortableTaskOptions = {
  update: function(ev, ui){
    var $list    = $(this).parents(".list"),
        $lis     = $("li", $list),
        $form    = $(".reorder_tasks_form", $list),
        path     = $form.attr("data-path"),
        task_id  = $(ui.item).attr("data-id"),
        position = ($lis.length - $lis.index(ui.item) - 1);
        
    $form.attr("action", path.replace(/%id/, task_id));
    
    $(".position", $form).val(position);
    $form.submit();
  }
};

var sortableListOptions = {
  update: function(ev, ui){
    var $lis     = $(this).children("li"),
        $form    = $(".reorder_lists_form", $(this)),
        list_id  = $(ui.item).attr("data-id"),
        position = ($lis.length - $lis.index(ui.item) - 1);
        
    $(".list_id", $form).val(list_id);
    $(".position", $form).val(position);
    // $form.submit();
  }
};

var autocompleteSharingOptions = {
  source: function(request, response){
    $.ajax({
      url: $("input#search_path").val(),
      dataType: "json",
      data: { q: request.term },
      success: function(data) {
        response(
          $.map(data, function(user){
            return { label: user.username, value: user.username }
          }));
      }
    });
  },
  minLength: 2,
  select: function(event, ui){
    if (ui.item) {
      $(this).addClass("username_valid");
      $(".share_form input.username").val(ui.item.value);
    } else {
      $(".share_form input.username").val("");
    }
  },
  open: function(){
    // console.log("opened");
    $(".share_form input.username").val("");
  },
  close: function(){
    // console.log("closed");
  }
};

Tasklist.lists = {
  create : function(ev){
    var $list = $(ev.list_html).hide().prependTo("#lists").fadeIn("slow");
    $("#list_name").val("");
    $(".tasks", $list).sortable(sortableTaskOptions);
    $(this).parents("li").sortable(sortableListOptions);
    $("input.ac_username", $list).autocomplete(autocompleteSharingOptions);
    $("#"+ev.list_id+"_task_task").focus();
  },
  
  destroy : function(ev){
    $(".list[data-id="+ev.list_id+"]").fadeOut("fast", function(){
      $(this).remove();
    });
  },
  
  share : function(ev){
    var $list = $(".list[data-id="+ev.list_id+"]");
    $("input.ac_username", $list).val("").removeClass("username_valid");
    $(ev.userHtml).prependTo(".share_form ul", $list);
    $(".input.username", $list).val(ui.item.value);
  }
};

$(document).bind("lists:create", Tasklist.lists.create);
$(document).bind("lists:destroy", Tasklist.lists.destroy);
$(document).bind("lists:share", Tasklist.lists.share);

$(".share_open, .share_close").live("click", function() {
  $(this).parents("li.list").find(".share_form").slideToggle("fast");
});

$("ul#lists").sortable(sortableListOptions);
$("ul.tasks").sortable(sortableTaskOptions);
$(".list input.ac_username").autocomplete(autocompleteSharingOptions);

$("li.task").live("click", function(e){
  if (e.target == this) {
    $("div.title a", this).callRemote();
    return false;
  }
});

$("form.share_list").submit(function(){
  return ($(".username", this).val().length > 0);
});

$("#new_list").submit(function(){
  return ($("#list_name").val().length > 0);
});

// Tasks

Tasklist.tasks = {
  create : function(ev){
    $("#"+ev.list_id+"_task_task").val("");
    $(ev.task_html).hide().prependTo(".list[data-id="+ev.list_id+"] .tasks").slideDown("fast");
  },
  
  toggle_complete : function(ev){
    $(".task[data-id="+ev.task_id+"]").replaceWith(ev.task_html);
  },
  
  destroy : function(ev){
    $(".task[data-id="+ev.task_id+"]").slideUp("fast", function(){
      $(this).remove();
    });
  },
  
  reorder : function(ev){
    var $task   = $(".task[data-id="+ev.task_id+"]"),
        $list   = $task.parents(".tasks"),
        $tasks  = $("li", $list),
        sindex  = $tasks.index($task),
        lindex  = $tasks.length - 1,
        tindex  = lindex - ev.position,
        $target = $("li:eq("+tindex+")", $list);
    
    if (tindex > sindex && tindex > 0) {
      $task.insertAfter($target);
    } else {
      $task.insertBefore($target);
    }
  }
};

$(document).bind("task:create", Tasklist.tasks.create);
$(document).bind("task:toggle_complete", Tasklist.tasks.toggle_complete);
$(document).bind("task:destroy", Tasklist.tasks.destroy);
$(document).bind("task:reorder", Tasklist.tasks.reorder);


$(".list").each(function(){
  var list_id      = $(this).attr("data-id"),
      list_channel = socket.subscribe("private-list-" + list_id);
      
      list_channel.bind("task-create", function(e){ $(document).trigger(e) });
      list_channel.bind("task-toggle-complete", function(e){ $(document).trigger(e) });
      list_channel.bind("task-destroy", function(e){ $(document).trigger(e) });
      list_channel.bind("task-reorder", function(e){ $(document).trigger(e) });
      
      // presence_channel = socket.subscribe("presence-list-" + list_id),
      // presence_channel.bind("pusher:subscription_succeeded", function(member){
      //   f.log("member subscribed: " + member[0].user_info.name);
      // });
      // 
      // presence_channel.bind("pusher:member_added", function(member){
      //   console.log("member added: " + member.user_info.name);
      // });
      // 
      // presence_channel.bind("pusher:member_removed", function(member){
      //   console.log("member removed: " + member.user_info.name);
      // });
});


$("#new_task").submit(function(){
  return ($("#new_task input.new_task").val().length > 0);
});
