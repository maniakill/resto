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
  $scope.openInBrowser=function(){ window.open('https://app.salesassist.eu', '_system', 'location=yes'); }
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
    orar : { luni: { from: '', to: '',from2: '', to2: ''},
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