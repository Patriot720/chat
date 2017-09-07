function sendmsg() {
    var msg = $('#text').val();
    $.post('/msg.php', { q: 'send', msg: msg, uid: $('#messages').attr('uid') })
}
class DOMHandler {
    constructor(divToInsertTo) {
        this.box = divToInsertTo;
    }

    process(data) {
        var parsed = this.parse(data);
        this.putOnPage(parsed);
    }
    parse(str) {
        this.checkString(str);
        var json = JSON.parse(str);
        var megastring = '';
        for (var item of json) {
            megastring += this.getDiv(item);
        }
        console.log('Kappa')
        return megastring;
    }
    putOnPage(str) {
        this.box.html(str);
    }
    checkString(str) {
        if (str == "no_api")
            location.replace("index.php")
        if (str.indexOf('Exception') > -1) {
            this.putOnPage(str);
            throw new Error(str);
        }
    }
    getShortpoll() {

    }
    loadShortPoll(data) {

    }

}
class Messages extends DOMHandler {

    load(uid) {
        $.post("/msg.php", { q: "messages.getHistory", user_id: uid }, (data) => this.process(data))
        this.box.attr("uid", uid);
    }
    setLastMsgId(mid) {
        this.box.attr('mid', mid);
    }
    getDiv(message) {
        if (typeof message != 'object') return '';
        var date = this.getDate(message['date']);
        var text = message['body'];
        var mid = message['mid'];
        var img = ''; // TODO
        var sender = ''; // IMG + SENDER
        return `<div class="msg" mid="${mid}"><img class="photo_50" src="${img}"><p class="sender">${sender}</p><p class="date">${date}</p><p class="msgtxt">${text}</p></div>`;
    }
    getDate(date) {
        var d = new Date(date);
        return d.getHours() + ":" + d.getMinutes();
    }
    loadShortPoll(data) {
        var msg = this.parse(data);
        this.box.prepend(msg);
    }
}
class Dialogs extends DOMHandler {
    constructor(divToInsertTo) {
        super(divToInsertTo);
        this.msg = [];
    }
    getIds(data) {
        this.checkString(data);
        data = JSON.parse(data);
        data.shift();
        var ids = '';
        for (var item of data) {
            ids += item['uid'] + ',';
        }
        return ids;
    }
    load(callback) {
        $.post("msg.php", { q: "messages.getDialogs" }, (data) => {
            var ids = this.getIds(data);
            $.post("msg.php", { q: "users.get", user_ids: ids, fields: 'photo_50' }, (data) => {
                this.process(data)
                callback();
            })
        })
    }
    getDiv(person) {
        var personName = person['first_name'] + ' ' + person['last_name'];
        var personId = person['uid']
        var last_msg = person['body'];
        var mid = person['mid']
        return `<div class="dialog list-group-item" uid="${personId}">${personName}</div>`;
    }
    refreshLastMID() {

    }
}
class ShortPoll {
    constructor() {
        this.observers = [];
    }
    checkChanges() {
        var last_msg = $('#messages').attr('mid');
        if (!last_msg) return;
        //console.log(last_msg)
        $.post('msg.php', { q: 'messages.get', last_message_id: last_msg }, (data) => {
            this.notify(data);
        })
    }
    notify(data) {
        for (var observer of this.observers) {
            observer.loadShortPoll(data);
        }
        return 0;
    }
}

function sendmsg(text) {
    var obj = {
        body: $('#text').val(),
        mid: $('#messages').attr('uid'),
        date: Date.now()
    }
    var msg = new Messages($("#messages"))
    var message = $(msg.getDiv(obj))

    $.post('/msg.php', { q: 'messages.send', message: obj['body'], uid: obj['mid'] }, (d) => {
        obj['mid'] = d;
        message = $(msg.getDiv(obj));
        msg.box.prepend(message);
    })

}
$(document).ready(() => {

    var dialogs = new Dialogs($("#dialogs"));
    var msg = new Messages($("#messages"))
    dialogs.load(() => msg.load($('.dialog').attr('uid')));

    $(document).on('click', '.dialog', function() {
        var uid = this.getAttribute('uid');
        $('.dialog').removeClass("active");
        $(this).addClass("active");

        msg.load(uid);
    })
    $("#text").on("keydown", function(e) {
        if (e.which == 13) {
            sendmsg();
            this.value = ''
        }
    })
    var shortpoll = new ShortPoll();
    shortpoll.observers.push(msg);
    shortpoll.observers.push(dialogs);
    setInterval(() => shortpoll.checkChanges(), 2000);
})