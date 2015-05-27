define(function(require, exports, module) {
    "require:nomunge,exports:nomunge,module:nomunge";
    
    var self = exports;
    //--
    var process = require('self/models/process');
    var console = require('self/models/console');
    var fileMgr = require('self/models/file_manager');
    var utils = require('mokit/utils');
    //--
    self.repos = [];                //工作区的工作目录
    self.repoPath = "";             //当前仓库目录
    self.branchs = [];              //当前仓库目录的分支列表
    self.branchName = "";           //当前分支
    self.changedFiles = [];         //当前编辑过的文件
    self.commits = [];              //当前未Push的提交
    self.remotes = [];              //当前远程库列表
    self.remote="";                 //当前使用的远程库
    //--
    self.exec = function(cmd, callback) {
        console.info(cmd+'\r\n');
        var cmd = process.exec(cmd, {
            cwd: self.repoPath
        },function(){
            if(callback)callback(cmd.buffer.out);
        });
    };
    //--
    self.loadRepos = function(callback) {
        self.repos = [];
        utils.each(fileMgr.currentInfo, function(i, item) {
            if(item.type=='dir' && item.isRoot){
                self.repos.push(item);
            }
        });
        if(self.repos.length>0){
            self.switchRepo(self.repoPath||self.repos[0].path,callback);
        }
    };
    
    self.loadBranchs=function(callback){
        self.branchs=[];
        self.exec('git branch',function(info){
            if(!utils.isNull(info)){
                var branchList = info.split('\n');
                utils.each(branchList,function(i,item){
                    var branchName = utils.trim(item);
                    if(utils.startWith(branchName,'*')){
                        branchName=utils.trim(branchName.replace('\*',''));
                        self.branchName = branchName;
                    }
                    if(branchName!==''){
                        self.branchs.push(branchName);
                    }
                });
                self.switchBranch(self.branchName,callback);
            }else{
                self.changedFiles=[];
                if(callback)callback(info);   
            }
        });
    };

    self.switchRepo = function(repoPath, callback) {
        self.repoPath = repoPath;
        self.branchs=[];
        self.remotes=[];
        self.changedFiles = []; 
        self.commits = []; 
        self.remote="";
        self.branchName="";
        self.loadBranchs(function(){
            self.loadRemote(function(){
                self.loadCommit(callback);
            });
        }); 
        console.write('Repo Switch To "'+ self.repoPath+'"\r\n');
    };
    
    self.switchBranch = function(branchName, callback) {
        self.branchName = branchName;
        self.changedFiles=[];
        self.exec('git add .',function(){
           self.exec('git checkout '+self.branchName,function(info){
                if(!utils.isNull(info)){
                    info = info.split('Your branch is ')[0];
                    var files = info.split('\n');
                    utils.each(files,function(i,item){
                        var file = utils.trim(item);
                        if(file !=""){
                            self.changedFiles.push(item);
                        }
                    });
                }
                self.loadCommit(callback);
                console.write('Branch Switch To "'+ self.branchName+'"\r\n');
            }); 
        });
    };
    
    self.refreshBranch=function(callback){
        self.switchBranch(self.branchName,callback);
    };
    
    self.deleteBranch = function(branchName,callback){
        //git branch -d <分支名> 
    };

    self.loadRemote = function(callback){
        self.remotes=[];
        self.exec('git remote',function(info){
            if(!utils.isNull(info)){
                var rets = info.split('\n');
                utils.each(rets,function(i,item){
                    var ret = utils.trim(item);
                    if(ret !=""){
                        self.remotes.push(item);
                    }
                });
            }
            self.setRemote(self.remote||self.remotes[0],callback)
        });
    };
    
    self.setRemote = function(remote,callback){
        self.remote = remote;
        if(callback)callback();
    };

    self.initRepo = function(callback) {
        self.exec('git init', callback);
    };

    self.clone = function(remoteUrl, callback) {
        self.exec('git clone ' + remoteUrl, callback);
    };

    self.pull = function(callback) {
        self.exec('git pull', callback);
    };
    
    self.push = function(callback){
        //git push master master
        self.exec('git push '+self.remote+' '+self.branchName+':'+self.branchName, function(){
            self.loadCommit(callback);
        });
    };

    self.commit=function(msg,callback){
        self.exec('git commit -a -m "'+msg+'"', function(){
            self.refreshBranch(function(){
                self.loadCommit(callback);
            });
        });
    };
    
    self.loadCommit=function(callback, localOnly){
        self.commits = []; 
        var cmd = 'git log ';
        if(self.remote!='' && self.branchName!='' && !localOnly){
            cmd +=self.branchName+' ^'+self.remote+'/'+self.branchName;
        }
        self.exec(cmd, function(info){
            if((utils.isNull(info)||utils.contains(info,'fatal')) && !localOnly){
                //self.loadCommit(callback,true);
                //如果和远程库比较，则进行一个本地查询，这里需要 return.
                if(callback)callback();
                return; 
            }else{
                info = info.split('\n');
                utils.each(info,function(i,item){
                    if(utils.startWith(item,'  ')){
                        var commit = utils.trim(item);
                        if(commit!=''){
                            self.commits.push(commit);
                        }
                    }
                });
                if(callback)callback();
            }
        });
    };

});