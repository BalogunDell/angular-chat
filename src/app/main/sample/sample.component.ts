 
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { FuseTranslationLoaderService } from '@fuse/services/translation-loader.service';

import { locale as english } from './i18n/en';
import { locale as turkish } from './i18n/tr';
import { VMdw_material_request_header, VMdw_material_request_detail, iButtons } from './sample.data';
import { MatTableDataSource } from '@angular/material';

@Component({
    selector   : 'sample',
    templateUrl: './sample.component.html',
    styleUrls  : ['./sample.component.scss']
})
export class SampleComponent implements OnInit
{
    
    li_Buttons_window:iButtons;
    lb_exit:boolean=false;
    lb_new:boolean=false;
    lb_first:boolean=false;
    lb_last:boolean=false;
    lb_next:boolean=false;
    lb_prior:boolean=false;
    lb_save:boolean=false;
    lb_delete:boolean=false;
    lb_print:boolean=false;
    lb_listing:boolean=false;
    lb_cheque:boolean=false;
    lb_void:boolean=false;
    lb_approve:boolean=false;
    lb_status:boolean=false;
    lb_attach:boolean=false;
    lb_browse:boolean=false;
    lb_custom_fields:boolean=false;
    lb_import:boolean=false;
    lb_undo:boolean=false;
    lb_send:boolean=false; 
    lb_refresh:boolean=false;  
    lb_close:boolean=false; 

    ls_sitepo_user:string="Y"
    lqueryparm;
    ls_menuCode:string;
    ls_mode:string;
    Idt_open_time:Date
    il_eas_count :number;
    id_vrdate:Date=new Date();
    mrqForm: any;
    submitted = false;
    collapseHeight = false; 
    formText = 'expand_more';
    formStyle = {
        width: '100%',
        display: 'block',
    };

    // Change width and max-width to that of your choice
    tableHeaderXsmall = {
        width: '70px',
      };


     // Change width and max-width to that of your choice
      tableHeaderSmall = {
        width: '150px',
      };

      tableHeaderLarge = {
        width: '500px',
      };


       // Change width and max-width to that of your choice
       tableHeaderXXSmall = {
        width: '150px',
      };

     
    mrqH: VMdw_material_request_header;  
 

    dataSource: MatTableDataSource<VMdw_material_request_detail>;
    displayedColumns = [ 'ite_code' , 'ite_name', 'specification', 'x_unit', 'x_request_qty', 'x_ite_qty', 'wbs', 'activity', 'prod_item', 'br_code', 'required_date', 'remarks'];
    constructor(
        private activatedRoute: ActivatedRoute,
    ){
        this.mrqH=this.iniModels();
        this.li_Buttons_window =this.setInilbutton()
    }


    ngOnInit(): void {
        this.activatedRoute.params.subscribe(value => {
            console.log(`You clicked on a menu item with id: ${value.id}`);
        });
    }

    collapseForm() {

        this.collapseHeight = !this.collapseHeight;
        
        this.formStyle.display = this.collapseHeight ? 'none' : 'block';
        this.formText = this.collapseHeight ? 'expand_less' : 'expand_more';
        console.log(this.collapseHeight);
    }


    iniModels(){

        let ldatDet:  VMdw_material_request_detail[] = [];
        let ldata: VMdw_material_request_header = {
            trc_code : '', 
            vr_no : 0, 
            vr_date : this.id_vrdate,  
            ref_no : '', 
            ref_date : this.id_vrdate,  
            disc_type : '', 
            disc_percent : 0, 
            acc_discount : 0, 
            cur_code : '', 
            cur_rate : 0, 
            material_request_header_verfied_ind : '', 
            delivery_terms : '', 
            payment_terms : '', 
            other_terms : '', 
            plant_req_no : 0, 
            dept_code : '', 
            job_no : '', 
            remarks : '', 
            contact_person : '', 
            can_ind : '', 
            fy_code : '20', 
            item_type : '', 
            sys1_user : '', 
            sys1_start_date : this.id_vrdate,  
            sys1_date : this.id_vrdate,  
            br_code : '', 
            location_type : '', 
            acc_code : '', 
            created_user : '', 
            approval_ind : '', 
            req_by : '', 
            acc_name : '', 
            request_for_subcontractor : '', 
            adv_date : this.id_vrdate,  
            adv_user : '', 
            serv_type : '', 
            serv_name : '', 
            site_po : '', 
            mrq_approval_ind : '', 
            withinbud : '', 
            client_name : '',  
            location_name :'',
            VMdw_material_request_details:   ldatDet 
            }
            return ldata;
    }

    add(){ 
        this.mrqH.VMdw_material_request_details.push(this.setDetailModel()); 
        this.dataSource = new MatTableDataSource(this.mrqH.VMdw_material_request_details);
    }

    checkInput (element) {
        const dotPos = element.target.value.indexOf('.');

        if (dotPos === -1) {
            element.target.value = parseFloat(element.target.value).toFixed(2);
        } 

           
        if (dotPos !== -1 && (element.target.value.split('.')[1].length < 2 || element.target.value.split('.')[1].length > 2)) {
            element.target.value = parseFloat(element.target.value).toFixed(2);
        }
    }
    setDetailModel(){  
        let ln_srno : number=1;
        if (this.mrqH !=undefined){

            if( this.mrqH.VMdw_material_request_details.length>0){

                let list: number[] = [];
                for(let key in   this.mrqH.VMdw_material_request_details) {
                    list[key]=this.mrqH.VMdw_material_request_details[key].sr_no;
                }
                ln_srno  = Math.max.apply(Math, list) 
                ln_srno= ln_srno + 1 
            }
        }


        let newOrderDetail: VMdw_material_request_detail = {

            
            trc_code : '', 
            vr_no : 0, 
            vr_date  : this.id_vrdate,  
            ite_code : '', 
            ite_qty : 0, 
            ite_rate : 0, 
            qty : 0, 
            sign_int : 0, 
            ite_name : '', 
            sr_no : ln_srno, 
            ite_unit : '', 
            can_int : '', 
            fy_code : '', 
            base_rate : 0, 
            specification : '', 
            job_no : '', 
            request_qty : 0, 
            activity : "", 
            work_order_no : '', 
            segment_no : '', 
            x_request_qty : 0.00, 
            x_ite_qty : 0, 
            x_unit : '', 
            x_factor : 0, 
            required_date : this.id_vrdate,  
            br_code : '', 
            remarks : '', 
            part_code : '', 
            wbs : '', 
            from_date : this.id_vrdate,  
            to_date  : this.id_vrdate,  
            asset_ind : '', 
            po_closed_qty : 0, 
            closed_request_qty : 0, 
            ref_vr_no : '', 
            ref_sr_no : 0, 
            budget_approved_amt : 0, 
            x_purchase_advised : 0, 
            purchase_advised : 0, 
            ref_trc : '', 
            ref_vrno : 0, 
            ref_srno : 0, 
            ref_dsrno : 0, 
            billing_unit : '', 
            billing_qty : 0, 
            exp_acc_code : '', 
            exp_category : '', 
            exp_group : '', 
            exp_category_name : '', 
            exp_subgroup : '', 
            x_cash_qty : 0, 
            cash_qty : 0, 
            grn_qty : 0, 
            qbac : 0, 
            qpendingmrq : 0, 
            qpendingpo : 0, 
            qstock : 0, 
            qactual : 0, 
            qbalance : 0, 
            qbudgetrate : 0, 
            qlastporate : 0, 
            qlowestpo : 0, 
            qmasterrate : 0, 
            bac : 0, 
            pendingmrq : 0, 
            pendingpo : 0, 
            stock : 0, 
            actual : 0, 
            balance : 0, 
            earnedvalue : 0, 
            method : '', 
            rrate : 0, 
            amt : 0, 
            rreason : '', 
            rate_tye : '', 
            gbac : 0, 
            gpendingmrq : 0, 
            gpendingpo : 0, 
            gstock : 0, 
            gactual : 0, 
            gbalance : 0, 
            ev_qty : 0, 
            ev_per : 0, 
            validation_level : 0, 
            acticvity_name : '', 
            grp_name : '', 
            job_head_budg : '', 
            job_head_budg_name : '', 
            prod_item : '',  
          }
          return newOrderDetail;
             
        }
        setInilbutton(){              
            let lbuttons: iButtons = {  lb_new:true,lb_first:false,lb_last:false,lb_next:false,lb_prior:false,lb_save:true,lb_delete:true,lb_print:true,lb_listing:false,lb_cheque:false,lb_void:false,lb_approve:false,lb_status:false,lb_attach:false,lb_browse:true,lb_custom_fields:false,lb_import:false,lb_undo:false,lb_send:false, lb_refresh:false, lb_close:true} 
            return lbuttons;
        }

        selectJob() {
            console.log('write this function bro');
        }

    
    ue_exit(event){alert('ue_exit');}
    ue_new(event){alert('ue_new');}
    ue_first(event){alert('ue_first');}
    ue_last(event){alert('ue_last');}
    ue_next(event){alert('ue_next');}
    ue_prior(event){alert('ue_prior');}
    ue_save(event){alert('ue_save');}
    ue_delete(event){alert('ue_delete');}
    ue_print(event){alert('ue_print');}
    ue_listing(event){alert('ue_listing');}
    ue_cheque(event){alert('ue_cheque');}
    ue_void(event){alert('ue_void');}
    ue_approve(event){alert('ue_approve');}
    ue_status(event){alert('ue_status');}
    ue_attach(event){alert('ue_attach');}
    ue_browse(event){alert('ue_browse');}
    ue_custom_fields(event){alert('ue_custom_fields');}
    ue_import(event){alert('ue_import');}
    ue_undo(event){alert('ue_undo');}
    ue_send(event){alert('ue_send');} 
    ue_refresh(event){alert('ue_refresh');}
    ue_close(event){alert('ue_close');}

}
