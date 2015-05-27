define(function(require, exports, module) {
    "require:nomunge,exports:nomunge,module:nomunge";
    "use strict";

    require('./git_style.css');
    var app = require("mokit/app");
    var fileMgr = require('self/models/file_manager');
    var utils = require("mokit/utils");
    var $ = require('mokit/jquery');
    var main = require('./main');

    /**
     * git 功能面板
     */
    return app.view.create({
        template: module.resovleUri('./git_tmpl.html'),
        el:{
          commitBox:'.git-commit-box'  
        },
        onInit: function(context) {
            var self = this;
        },
        onRender: function(context) {
            var self = this;
        },
        openConsole:function(context){
            var self = this;
            main.context.view.openFooter(main.context, 'console');
        },
        repoChange:function(context){
            var self = this;
            self.openConsole();
            var selectElement = context.$element.find('option:selected');
            var path = selectElement.attr('data-path');
            self.model.git.switchRepo(path,function(){
                self.render();
            });
        },
        branchChange:function(context){
            var self = this;
            self.openConsole();
            var selectElement = context.$element.find('option:selected');
            var branchName = utils.trim(selectElement.text());
            self.model.git.switchBranch(branchName,function(){
                fileMgr.loadDirInfo(self.model.git.repoPath);
                self.render();
            });
        },
        initRepo: function(context) {
            var self = this;
            self.openConsole();
            self.model.git.initRepo(function(){
                self.render();
            });
        },
        clone: function(context) {
            var self = this;
            self.openConsole();
            self.model.git.clone('',function(){
                self.render();
            });
        },
        pull: function(context) {
            var self = this;
            self.openConsole();
            self.model.git.pull(function(){
                self.render();
            });
        },
        push: function(context){
            var self = this;
            self.openConsole();
            self.model.git.push(function(){
                self.render();
            });
        },
        refreshBranch:function(context){
            var self = this;
            self.openConsole();
            self.model.git.refreshBranch(function(){
                self.render();
            });
        },
        commit:function(context){
            var self = this;
            self.openConsole();
            self.model.git.commit(self.el.commitBox.val(),function(){
                self.render();
            });
        }
    });

});