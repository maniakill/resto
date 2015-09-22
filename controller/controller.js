app.controller('login',['$scope','$http','$templateCache','$location','$timeout','project','$routeParams',function ($scope,$http,$templateCache,$location,$timeout,project,$routeParams) {
  // project.deleteData();/
  var token = localStorage.getItem('Rtoken');
  if(token){ $location.path('/contracts'); }
  if($routeParams.error){ $scope.alerts=[{type:'danger',msg:$routeParams.error}]; }
  $scope.method = 'POST';
  $scope.url = 'https://app.salesassist.eu/pim/mobile/admin/';
  $scope.params = [];
  // $scope.username = localStorage.getItem('Rusername') && localStorage.getItem('Rusername') != undefined ? localStorage.getItem('Rusername') : '';
  $scope.fetch = function() {
    var p = $.param({ username:$scope.username, password: $scope.password, restopass: 1 });
    if($scope.username && $scope.password){
      project.doGet('post',p).then(
      function(r) {
        if(r.data.code == 'ok'){
          localStorage.setItem('Rtoken',r.data.response);
          localStorage.setItem('Rusername',$scope.username);
          localStorage.setItem('RLang',r.data.lang_id);
          localStorage.setItem('Rfirst_name',r.data.first_name);
          localStorage.setItem('Rlast_name',r.data.last_name);
          localStorage.setItem('Remail',r.data.email);
          project.setKey();
          $location.path('/contracts');
        }else{
          $scope.alerts=[{type:'danger',msg:r.data.error_code}];
        }
        project.stopLoading();
      },
      function(data){
        $scope.alerts=[{type:'danger',msg:'Server error. Please try later'}];
      });
    }else{
      $scope.alerts=[{type:'danger',msg:'Please fill all the fields'}];
    }
  }
  $scope.closeAlert=function(index){$scope.alerts.splice(index,1);}
  // $scope.openInBrowser=function(){ window.open('https://app.salesassist.eu', '_system', 'location=yes'); }
}]).controller('contracts', ['$scope','$timeout','project', function ($scope,$timeout,project){
  var getparams = {'do' : 'restopass-orders',view:0};
  $scope.views = [{name:'All',view:'all',active:'active',p:'0'}];
  $scope.orders = [];
  $scope.openeds = false;
  $scope.selectedInput = null;
  // ,{name:'My orders',view:'my_order',active:'',p:'4'},{name:'Draft',view:'draft',active:'',p:'1'},{name:'Ready to deliver',view:'ready',active:'',p:'2'},{name:'Fully delivered',view:'fully',active:'',p:'3'}
  $scope.snap = function(){
    angular.element('.main_menu').show(0,function(){
      var _this = angular.element('.cmain_menu'), width = _this.outerWidth();
      _this.removeClass('slide_right slide_left').css({'left':'-'+width+'px'});
      $timeout(function(){ _this.addClass('slide_left'); });
    });
  }
  $scope.today = function() { $scope.dt = new Date(); };
  $scope.today();
  $scope.clear = function () { $scope.dt = null; };
  $scope.open = function($event,type) {
    $event.stopPropagation();
    $scope.openeds = true;
    $scope.selectedInput = type;
  };
  $scope.$on('selectDate',function(arg,args){
    var d = date_fromater($scope.pick_date_format,args);
    $scope[$scope.selectedInput] = d;
    $scope.openeds = false;
    $scope.selectedInput = null;
  });
  $scope.$on('closeDateP',function(arg){ $scope.openeds = false; });
  $scope.dateOptions = { 'starting-day': 1,'show-weeks':false, };
  $scope.showSearch = function(){
    $scope.search = !$scope.search;
    angular.element('.search').toggleClass('cancel');
    angular.element('.loaded').toggleClass('lower');
    if(!$scope.search){
      $scope.serch=''; $scope.sdate=''; $scope.edate=''; $scope.ddate=''; $scope.dedate='';
      // $scope.submit();
    }
  }
  // $scope.orders = [{ status:'blue', serial_number:'123',created:'12/12/12',our_ref:'abc',delivery_date:'12/12/12',buyer_name:'mama',amount:'1230',id:1},
  //                  { status:'blue', serial_number:'124',created:'12/10/12',our_ref:'abc',delivery_date:'12/10/12',buyer_name:'mama',amount:'1231',id:2}];
  $scope.doIt = function(method,params,callback){
    project.doGet(method,params).then(function(r){
      var res = r.data;
      if(res.code!='error'){
        $scope.pagg = res.pagin;
        $scope.backlink = res.backlink;
        $scope.nextlink = res.nextlink;
        $scope.last_link = res.last_link;
        $scope.first_link = res.first_link;
        $scope.is_pagination = res.is_pagination;
        $scope.orders.length = 0;
        $scope.pick_date_format = res.pick_date_format;
        angular.forEach(res.order_row,function(value,key){ $scope.orders.push(value); });
        if (callback && typeof(callback) === "function") { callback(); }
      }
      project.stopLoading();
    },function(){project.stopLoading();});
  }
  $scope.open = function($event,type) {
    $event.stopPropagation();
    $scope.openeds = true;
    $scope.selectedInput = type;
  };
  $timeout( function(){ $scope.doIt('get',getparams); });

}]).controller('menu',['$scope','project','$timeout','$location',function ($scope,project,$timeout,$location){
  $scope.snap_back = function(){
    $timeout(function(){ angular.element('.cmain_menu').addClass('slide_right'); });
    $timeout(function(){ angular.element('.main_menu').hide(); },400);
  }
  $scope.go = function(h){ $location.path(h); }
  $scope.handleGesture = function($event){ $scope.snap_back(); }
  $scope.name = localStorage.Rlast_name && localStorage.Rfirst_name ? localStorage.Rlast_name + ' ' + localStorage.Rfirst_name : localStorage.Rusername;
  $scope.email = localStorage.Remail ? localStorage.Remail : '';
  $scope.logout = function(){ var code ={}; code.logout = true; project.logout(code); }
}]).controller('add', ['$scope','$http','$timeout','project','$modal','$rootScope','camera','$location','$routeParams','notification', function ($scope,$http,$timeout,project,$modal,$rootScope,camera,$location,$routeParams,notification){
  $scope.c_id = isNaN($routeParams.id) === false ? $routeParams.id : 0;
  var getparams = {'do' : 'restopass-order',c_id:$scope.c_id};
  $scope.step=1;
  $scope.cStuff = { comp_start : false, c_start : false,
    orar :  { luni: { from: '', to: '',from2: '', to2: ''},
              marti: { from: '', to: '',from2: '', to2: ''},
              miercuri: { from: '', to: '',from2: '', to2: ''},
              joi: { from: '', to: '',from2: '', to2: ''},
              vineri: { from: '', to: '',from2: '', to2: ''},
              sambata: { from: '', to: '',from2: '', to2: ''},
              duminica: { from: '', to: '',from2: '', to2: ''}
            }
  };
  $scope.client = {};
  $scope.myVar = {};
  $scope.image = [];
  $scope.photos = {types : 0};
  $scope.sigCapture = null;
  $scope.conditions = false;
  $scope.sendEmail = { show : false };
  $scope.openeds = false;
  $scope.pick_date_format = 'dd/MM/yyyy';
  $scope.hours=[];
  $scope.sendEmail.lng = 0;

  for (var i = 7; i < 24; i++) {
    var text = i;
    if(text < 10){
      text='0'+text;
    }
    $scope.hours.push(text+':00');
    if(text != 23 ){
      $scope.hours.push(text+':30');
    }
  };

  $scope.status = {
    isopen: false
  };
  $scope.closeAlert=function(index){$scope.alerts.splice(index,1);}
  $scope.toggleDropdown = function($event) {
    $event.preventDefault();
    $event.stopPropagation();
    $scope.status.isopen = !$scope.status.isopen;
  };

  $scope.today = function() { $scope.dt = new Date(); };
  $scope.today();
  $scope.clear = function () { $scope.dt = null; };
  $scope.open = function($event) {
    $event.stopPropagation();
    $scope.openeds = true;
  };
  $scope.$on('selectDate',function(arg,args){
    var d = date_fromater($scope.pick_date_format,args);
    $scope.cStuff.jour_de_visite = d;
    $scope.openeds = false;
  });
  $scope.$on('closeDateP',function(arg){ $scope.openeds = false; });
  $scope.dateOptions = { 'starting-day': 1,'show-weeks':false, };

  $scope.go_to = function(i){
    switch (i){
      case 2:
        if($scope.client.types == undefined){
          $scope.myVar.types = 'red';
          return false;
        }
        if ($scope.client.types==0 && $scope.cStuff.buyer_id==undefined) {
          $scope.myVar.cname='red';
          return false;
        }else if($scope.client.types==0 && $scope.cStuff.customer_name==undefined){
          $scope.myVar.cname='red';
          return false;
        }
        $scope.cStuff.clientType = $scope.client.types;
        break;
    }
    $scope.step = i;
    if($scope.step == 8){
      $timeout(function(){
        $scope.sigCapture = new SignatureCapture( "signature" );
        if($scope.signature){
          $scope.sigCapture.draw($scope.signature);
        }else{
          $scope.sigCapture.draw('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAr8AAAGUCAIAAACz+N3RAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA4ZpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDo5ZDliOTgwYS01ZmJjLTRiZjMtOGQwZi1iZGExYzYxMGMzNWMiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6M0JDMTdDNkEyQzc1MTFFNTlGOTQ4QzEzNjA4REJBQjgiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6M0JDMTdDNjkyQzc1MTFFNTlGOTQ4QzEzNjA4REJBQjgiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTUgKE1hY2ludG9zaCkiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDo3Y2YzNDBkZC1hZmRmLTQ0YjMtYWEzNy03OWYyNDVkMTY1ZjYiIHN0UmVmOmRvY3VtZW50SUQ9ImFkb2JlOmRvY2lkOnBob3Rvc2hvcDpmNWRlODJiZi03NGNjLTExNzgtOGY4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');
        }
      });
    }
    $timeout(function(){ console.log($scope.cStuff) });
  }
  $scope.clear = function(){
    if($scope.sigCapture){
      $scope.sigCapture.clear();
    }
  }
  $scope.autou = function(item){
    $scope.cStuff.commercial_id = item.id;
  }
  $scope.cs3 = function(){
    $scope.cStuff.commercial_id = '';$scope.cStuff.commercial = '';
  }
  $scope.autos = function(item){
    $scope.myVar.cname='';
    $scope.lq = item.lang_id && item.lang_id!=0 ? item.lang_id : 1 ; $scope.c=item.currency_id && item.currency_id!=0 ? item.currency_id : 1; $scope.custname= item.ref;
    $scope.s_buyer_id = item.label; $scope.contact_id='';$scope.s_customer_id='';
    $scope.cStuff.customer_name = item.ref;
    var details = { 'do':'restopass-xcustomer_details', c_id:item.id };
    $scope.doIt('get',details,function(r){
      for(x in r){
        if(x == 'in'){
          continue;
        }
        $scope.cStuff[x] = r[x];
      }
      $scope.cStuff.buyer_id=item.id;
    });
  }
  $scope.autosc = function(item){
    $scope.contact_id=item.id; $scope.s_buyer_id = item.c_name; $scope.buyer_id=item.customer_id; $scope.s_customer_id=item.label;
    var details = { 'do':'restopass-xcustomer_details', c_id:item.customer_id,contact_id:item.id };
    $scope.doIt('get',details,function(r){
      for(x in r){
        if(x == 'in'){
          continue;
        }
        $scope.cStuff[x] = r[x];
      }
      $scope.cStuff.buyer_id=item.customer_id;
      $scope.cStuff.contact_id=item.id;
    });
  }
  $scope.copyFromTop = function(d){
    var copy = false,copyFrom;
    angular.forEach($scope.cStuff.orar,function(i,v){
      if(copy == true){
        $scope.cStuff.orar[v] = angular.copy(copyFrom);
      }
      if(d == v){
        copy = true;
        copyFrom = i;
      }
    });
  }
  $scope.closeDay = function(d){
    $scope.cStuff.orar[d] = { from: '', to: '',from2: '', to2: '',closed: true};
  }
  $scope.getLocation = function(val,pag) {
    var customer_id = $scope.cStuff.buyer_id ? $scope.cStuff.buyer_id : 0;
    return $http.get('https://app.salesassist.eu/pim/mobile/admin/',{params:{'do':'restopass-'+pag,api_key:localStorage.Rtoken,username:localStorage.Rusername,term:val, customer_id:customer_id}}).then(function(res){
      var authors = [];
      angular.forEach(res.data, function(item){ authors.push(item); });
      return authors;
    });
  };
  $scope.snap = function(){
    angular.element('.main_menu').show(0,function(){
      var _this = angular.element('.cmain_menu'), width = _this.outerWidth();
      _this.removeClass('slide_right slide_left').css({'left':'-'+width+'px'});
      $timeout(function(){ _this.addClass('slide_left'); });
    });
  }
  $scope.copyaddr = function(e){
    if(e.currentTarget.checked === true){
      $scope.cStuff.dcustomer_name = $scope.cStuff.customer_name;
      $scope.cStuff.daddress = $scope.cStuff.address;
      $scope.cStuff.dzip = $scope.cStuff.zip;
      $scope.cStuff.dcity = $scope.cStuff.city;
      $scope.cStuff.dtell = $scope.cStuff.tell;
      $scope.cStuff.dmail = $scope.cStuff.mail;
    }else{
      $scope.cStuff.dcustomer_name = '';
      $scope.cStuff.daddress = '';
      $scope.cStuff.dcity = '';
      $scope.cStuff.dcity = '';
      $scope.cStuff.dtell = '';
      $scope.cStuff.dmail = '';
    }
  }
  $scope.cs = function(){ $scope.cStuff.buyer_id=undefined; $scope.s_buyer_id = ''; $scope.contact_id = 0; $scope.s_customer_id = ''; $scope.cStuff.comp_start = false; $scope.myVar.cname=''}
  $scope.cs2 = function(){ $scope.cStuff.c_start = false; }
  $scope.cs();
  $scope.task_type = [ { title: 'Take Photo', url: 'photo' }, { title: 'Go to galery', url: 'getPhoto'} ];

  /*modal*/
    $scope.add_photos = function () {
      var modalInstance = $modal.open({
        templateUrl: 'layout/task_type.html',
        controller: 'task_type1',
        resolve: {
        items: function () { return $scope.task_type; },
        types: function(){ return $scope.types; }
        }
      });
    };
    /*modalend*/
    $scope.capturePhoto = function(s){
      camera.Photo($scope.photoSuccess,$scope.fail,s)
    }

    $scope.photoSuccess = function (imageData) {
      $scope.image.push({img:"data:image/jpeg;base64," + imageData});
    }
    $scope.fail = function (message) { alert('Failed because: ' + message); }

    $rootScope.$on('camera',function(arg,args){
      $scope.capturePhoto(args);
    });

    $scope.openInBrowserP=function(){ window.open('https://app.salesassist.eu', '_system', 'location=yes'); }
    $scope.SendEmail = function(){
      if(!$scope.sendEmail.email){
        alert("Email required");
        return;
      }else{
        var re = /\S+@\S+\.\S+/;
        if(!re.test($scope.sendEmail.email)){
          alert("Invalid email");
          return;
        }
      }
      if(!$scope.sendEmail.subject){
        alert("Subject required");
        return;
      }
      if(!$scope.sendEmail.emailBody){
        alert("Body message required");
        return;
      }
      var data = { 'to':$scope.sendEmail.email,
                   'subject' : $scope.sendEmail.subject,
                   'body' : $scope.sendEmail.emailBody,
                   'c_id' : $scope.c_id,
                   'lng' : $scope.sendEmail.lng,
                   'do' : 'restopass--restopass-sendMail' }
      if( $scope.c_id != 0 ){
        data.c_id = $scope.c_id;
      }
      var p = $.param(data);
       project.doGet('post',p).then(function(r) {
        if(r.data.code == 'ok'){
          alert('Email Sent.');
        }else{
          $scope.alerts=[{type:'danger',msg:r.data.error_code}];
        }
        project.stopLoading();
      },
      function(data){
        $scope.alerts=[{type:'danger',msg:'Server error. Please try later'}];
      });
    }
    $scope.closeEmail = function(){ $scope.sendEmail.show = false; }

    $scope.save = function(){
      var data = { 'cStuff':{customer:$scope.cStuff,
                             photoType : $scope.photos.types,
                             img : $scope.image,
                             signature : $scope.sigCapture.toString()},
                    'do' : 'restopass--restopass-add' }
      if( $scope.c_id != 0 ){
        data.do = 'restopass--restopass-update';
        data.c_id = $scope.c_id;
      }
      var p = $.param(data);
       project.doGet('post',p).then(function(r) {
        if(r.data.code == 'ok'){
          // console.log(r);
          $scope.c_id = r.data.response;
          // $location.path('/contracts');
        }else{
          $scope.alerts=[{type:'danger',msg:r.data.error_code}];
        }
        project.stopLoading();
      },
      function(data){
        $scope.alerts=[{type:'danger',msg:'Server error. Please try later'}];
      });
    }

  $scope.delete_img = function(index){
    $scope.imgToDelete = index;
    notification.confirm('Are you sure you want to delete this image?',$scope.realyDeleteImg,'Delete Image',['Yes','No']);
  }
  $scope.realyDeleteImg = function(i){
    if(i == 1 && $scope.imgToDelete){
      $scope.image.splice($scope.imgToDelete, 1);
    }
  }
  $scope.showPdf = function(i){
    if(i==1){
      $scope.lng = 1;
      $scope.pdfsn = !$scope.pdfsn;
      $scope.pdfs = false;
    }else{
      $scope.lng = 0;
      $scope.pdfs = !$scope.pdfs;
      $scope.pdfsn = false;
    }
  }
  $scope.doIt = function(method,params,callback){
    project.doGet(method,params).then(function(r){
      var res = r.data;
      if(res.code!='error'){
        if (callback && typeof(callback) === "function") { callback(res); }
      }else{
        $location.path('/contracts');
      }
      project.stopLoading();
    },function(){project.stopLoading();});
  }

  $scope.auth_callback = function() {
    if (client.isAuthenticated()) { $scope.sendDb2(0); }
    else { project.stopLoading(); }
  }

  $scope.sendDb = function(i){
    // console.log('sendDb');
    project.loading();
    client.authenticate($scope.auth_callback);
  }

  $scope.sendDb2 = function(i){
    // console.log('sendDb2');
    if(i >= $scope.image.length){
      // $scope.alerts=[{type:'success',msg:'Files saved'}];
      project.stopLoading();
      return false;
    }
      if($scope.image[i].saved){
        return $scope.sendDb2(i+1);
      }
      var data = $scope.image[i].img.split(',')[1];
      var blob = b64toBlob(data, 'image/jpeg');
      var timeInMs = Date.now();
      client.writeFile("apps/restopass/img_"+timeInMs+".jpg", blob, function(error, stat) {
        // console.log(stat);
        if (error) {
          if(error.response == null){
            project.stopLoading();
            return client.signOut($scope.sendDb);
          }else{
            // console.log(error);
            project.stopLoading();
            alert(error.responseText);
            return false;
          }
        }
        $scope.$apply(function () {
          // console.log('File saved '+i);
          $scope.image[i].saved = stat.path;
        });
        return $scope.sendDb2(i+1);
      });
  }

  if($scope.c_id != 0 ){
    $timeout( function(){ $scope.doIt('get',getparams,function(r){
        $scope.cStuff = r.data.customer;
        $scope.photos.types = r.data.photoType ? r.data.photoType : 0;
        $scope.image = r.data.img ? r.data.img : [];
        $scope.signature = r.data.signature;
        $scope.client.types = $scope.cStuff.clientType;
      });
    });
  }


}]).controller('task_type1',['$scope','$modalInstance','items', '$location', 'types','camera','$rootScope',
  function ($scope, $modalInstance, items, $location, types,camera,$rootScope) {
    $scope.items = items;
    $scope.types = types;
    $scope.open = function(url){
      switch(url){
        case 'photo':
          $rootScope.$emit('camera', '');
          break;
        case 'getPhoto':
          $rootScope.$emit('camera', '1');
          break;
      }
      $scope.cancel();
    }
    $scope.cancel = function () { $modalInstance.dismiss('cancel'); };
  }
]).controller('pdf',['$scope','$location','$routeParams',
  function ($scope, $location, $routeParams) {
    if(!$scope.c_id){
      $scope.c_id = isNaN($routeParams.id) === false ? $routeParams.id : false;
    }

    var url = 'https://app.salesassist.eu/pim/mobile/admin/?api_key='+localStorage.Rtoken+'&do=restopass-contract_print&username='+localStorage.Rusername+'&c_id='+$scope.c_id+'&lng='+$scope.lng;
      PDFJS.workerSrc = 'js/pdf.worker.js';

      var pdfDoc = null, pageNum = 1, pageRendering = false, pageNumPending = null, scale = 1.5, canvas = document.getElementById('the-canvas'), ctx = canvas.getContext('2d');

      function renderPage(num) {
        pageRendering = true;
        pdfDoc.getPage(num).then(function(page) {
          var viewport = page.getViewport(scale);
          canvas.height = viewport.height;
          canvas.width = viewport.width;
          var renderContext = {
            canvasContext: ctx,
            viewport: viewport
          };
          var renderTask = page.render(renderContext);
          renderTask.promise.then(function () {
            pageRendering = false;
            if (pageNumPending !== null) {
              renderPage(pageNumPending);
              pageNumPending = null;
            }
          });
        });
        document.getElementById('page_num').value = pageNum;
        $('#quotePreview center').remove();
        $('#bxWrapper').removeClass('hide');
      }

      function queueRenderPage(num) {
        if (pageRendering) {
          pageNumPending = num;
        } else {
          renderPage(num);
        }
      }

      function onPrevPage(e) {
        e.preventDefault();
        if (pageNum <= 1) {
          return;
        }
        pageNum--;
        queueRenderPage(pageNum);
      }
      document.getElementById('prev').addEventListener('click', onPrevPage);

      function onNextPage(e) {
        e.preventDefault();
        if (pageNum >= pdfDoc.numPages) {
          return;
        }
        pageNum++;
        queueRenderPage(pageNum);
      }
      document.getElementById('next').addEventListener('click', onNextPage);

      PDFJS.getDocument(url).then(function (pdfDoc_) {
        // console.log('e');
        pdfDoc = pdfDoc_;
        document.getElementById('page_count').textContent = '/ ' + pdfDoc.numPages;
        renderPage(pageNum);
      });
  }
]);