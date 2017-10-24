//modified functions
omnis_form.prototype.prepareForScripts = function() {

    function a(a) {
		        var b;
        a.subFormObj && a.subFormObj.userInfo ? (b = jOmnis.parseCommaSeparatedList(a.subFormObj.userInfo), b = ["$init", eDoMethodFlags.clientOnly | eDoMethodFlags.noLog].concat(b), b = a.callMethodEx.apply(a, b)) : b = a.callMethodEx("$init", eDoMethodFlags.clientOnly | eDoMethodFlags.noLog);
        "string" != typeof b || jOmnis.beforeUnload || (jOmnis.beforeUnload = b, window.onbeforeunload = gBeforeUnload);
        if (a.scriptNotify) {
            for (b = 0; b < a.scriptNotify.length; ++b) a.scriptNotify[b].scriptAvail();
            a.scriptNotify = null
        }
    }
    null == this.mMethodNamePrefix && (this.mMethodNamePrefix = this.omnislib + "_" + this.omnisclass + "_", this.mMethodNamePrefix = this.mMethodNamePrefix.replace(/[^a-zA-Z0-9_$]/g, "_").toLowerCase());
    this[this.mMethodNamePrefix + "__setivars"]();
    if (this.inst.inRequest || 0 != this.loadingSubform) var b = this,
        c = setInterval(function() {
            b.inst.inRequest || 0 != b.loadingSubform || (clearInterval(c), a(b))
        }, 10);
    else a(this);
	//modification start
	//alert('prepareForScripts');
	this.callMethodEx('$restoreFormData');
	//call method $init for all subobjects, that have this method
	this.$objs().$sendall(function ($ref) {if ($methodExists($ref.objNumber,'$init',$ref.form)) {$ref.callMethod('$init')}})
	//modification end
};

omnis_inst.prototype.commsHandleResultFromServer = function(a, b) {
    if (-1 == b.indexOf("ORFCMess") || -1 == b.indexOf("ORFCParam")) {
        if (b.length) {
            var c = this;
            setTimeout(function() {
                jOmnis.okMessage(jGetOmnisString(c, "error"), b)
            }, 0);
            this.lastMessage == eORFCmess.MethodWithReturn && jOmnis.hideOverlay(!0)
        }
    } else try {
        var d = jOmnis.parseJSON(b);
        null != d.OMNISServer && (this.omnisserverandport = d.OMNISServer);
        this.commsParams = d.ORFCParam;
        switch (d.ORFCMess) {
            case eORFCmess.RConnect:
                if (this.lastMessage == eORFCmess.Connect) return this.commsParamsExec(a, !0);
                break;
            case eORFCmess.RReConnect:
                if (this.lastMessage == eORFCmess.ReConnect) return this.commsParamsExec(a);
                break;
            case eORFCmess.RDisconnect:
                if (this.lastMessage == eORFCmess.Disconnect) return this.commsParamsExec(a);
                break;
            case eORFCmess.RMethod:
                if (this.lastMessage == eORFCmess.MethodWithReturn || this.lastMessage == eORFCmess.Method) return this.commsParamsExec(a);
                break;
            case eORFCmess.REvent:
                if (this.lastMessage == eORFCmess.Event) {
                    var e = this.commsParamsExec(a);
                    this.mEventResponseObject && (this.mEventResponseObject.eventResponseHasBeenProcessed(),
                        this.mEventResponseObject = null);
                    return e
                }
                break;
            case eORFCmess.ROpenAnotherForm:
                if (this.lastMessage == eORFCmess.OpenAnotherForm) return this.commsParamsExec(a);
                break;
            case eORFCmess.ROpenSubform:
                if (this.lastMessage == eORFCmess.OpenSubform) return this.commsParamsExec(a);
                break;
            case eORFCmess.RCloseSubform:
                if (this.lastMessage == eORFCmess.CloseSubform) return this.commsParamsExec(a);
                break;
            case eORFCmess.RBulkLoad:
                if (this.lastMessage == eORFCmess.BulkLoad) return this.commsParamsExec(a);
                break;
            case eORFCmess.ErrorDisconnected:
			    //alert('disconnected')
            case eORFCmess.Error:
				jOmnis.setOpacity(this.elem,50);
				this.serverError = !0;
				var f;
                f = d.ORFCMess == eORFCmess.ErrorDisconnected ? jGetOmnisString(this, "disconnected") : d.ORFCParam + "";
                var g = this;
                setTimeout(function() {
					/* original code
					jOmnis.okMessage(jGetOmnisString(g, "error"), f)
					*/
					//replcement start this is jOmnis.omnisInsts[???]
					//todo: make a backup for each form loopin through all jOmnis.omnisInsts and jOmnis.omnisInsts.forms 
					var r = confirm("Connection lost - Try to Reconnect?");
						if (r == true) {
							//MyStatus = $cform.callMethod("$clientcommand","savepreference",jOmnis.fn.row('_BACKUP_'+$cform.number, $cform.instanceVars.lstData.toSource()));
							MyStatus=localStorage.setItem('_BACKUP2_'+$cform.number,JSON.stringify(eval($cform.instanceVars.lstData.toSource())))
							jOmnis.onLoad()
						} else {
						var r = confirm("Continue in Zombie Mode?");
							if (r == true) { jOmnis.setOpacity(g.elem,255);	} 
							else { jOmnis.okMessage(jGetOmnisString(g, "error"), f)	} 															
						} 
					// replacement end			
                }, 10);
                this.commsParamsClear();
                this.lastMessage == eORFCmess.MethodWithReturn && jOmnis.hideOverlay(!0);
                return !0
			}
        jOmnis.okMessage(jGetOmnisString(this, "error"), jGetOmnisString(this, "omn_inst_respbad"))
		
    } catch (h) {
        jOmnis.handleError(h, this), this.commsParamsClear()
    }
    return !1
};



//added functions
function restoreFormData(pDoOpacityCheck=true,pForm=$cform)
{
var MyCheckOK=true;
if (pDoOpacityCheck) {MyCheckOK=((pForm.inst.elem.style.opacity||1)<1);}
if (MyCheckOK) 
	{
	//add loop through all forms of all jOmnis.omnisInsts	
	pForm.inst.elem.style.opacity=1;
	//console.log("2trying to recover data");
	MyBackup=JSON.parse(localStorage.getItem('_BACKUP2_'+pForm.number))

	if (jOmnis.fn.not(jOmnis.fn.isclear(MyBackup))) 
		{
		$.each(pForm.ivars, function (ivarName,ivarNum) 
			{
			var ivarValue=MyBackup[ivarNum-1]
			var ivarType=pForm.instanceVars.lstDef[ivarNum-1][1]
			//list or row
			if (ivarType =='29')      
				{
				if (typeof(ivarValue)=='undefined') { pForm.set(ivarName,)}
				else {
					 pForm.get(ivarName).lstData=ivarValue.lstData;
					 pForm.set(ivarName,jOmnis.copyValue(pForm.get(ivarName)));
					 }
				}
			//other field types
			else {pForm.set(ivarName,jOmnis.copyValue(ivarValue))}
			}
			);
		}
	}
};

function $methodExists(pObjNr,pMethodName,pForm=$cform) 
{
	return eval('typeof(pForm.mChildren['+(pObjNr-1)+'].'+pForm.mMethodNamePrefix+pObjNr+'_'+pMethodName+'_'+pForm.number+')')=='function'
}

//this will become a function available in all forms
omnis_form.prototype.$redraw = function() 
{
	var MyForm=this
     $(Object
     .keys(this.$objs)
     .filter( function (elem,i,array) {var MyRegEx=/^[A-Z_1-9]+$/; return MyRegEx.test(elem);}) 
      )
     .each( function (i,elem) {eval('MyForm.$objs.'+elem+'.$redraw()')})
	 //call a redraw of all objs of the form, that have a redraw method
	 this.$objs().$sendall(function ($ref) {if ($methodExists($ref.objNumber,'$redraw',$ref.form)) {$ref.callMethod('$redraw')}})
}

omnis_form.prototype.$backupFormData = function() {localStorage.setItem('_BACKUP2_'+this.number,JSON.stringify(eval(this.instanceVars.lstData.toSource())))};

omnis_form.prototype.$restoreFormData = function(pDoOpacityCheck=true) {restoreFormData(pDoOpacityCheck,this)};

function lstData2lstDataObj(pLIST) {
    var MyData= [];
pLIST.lstData.forEach(
    function (currentValue, index1, array) {
        MyData= (typeof MyData=="undefined") ? []:MyData;
        MyData[index1]= pLIST.lstDef.reduce (
            function(result, item, index2, array) {
                result[item[0]]=pLIST.lstData[index1][index2];
                return result;
            },
            {}
        );
    }
);
return MyData;
}

omnis_raw_list.prototype.$lstDataObj = function () {return lstData2lstDataObj(this)};

function Marquee_filterArgs(args) {
    var filteredArgs = {};
    var keys = Object.keys(args);
    for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        var value = args[key];
        if (value instanceof Object && value.constructor === Object) {
            filteredArgs[key] = JSON.stringify(value);
        } else {
            filteredArgs[key] = value;
        }
    }
    return filteredArgs;
}