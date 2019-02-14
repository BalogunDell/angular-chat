export interface VMdw_material_request_header { 

    trc_code : string 
    vr_no : number 
    vr_date : Date  
    ref_no : string 
    ref_date : Date  
    disc_type : string 
    disc_percent : number 
    acc_discount : number 
    cur_code : string 
    cur_rate : number 
    material_request_header_verfied_ind : string 
    delivery_terms : string 
    payment_terms : string 
    other_terms : string 
    plant_req_no : number 
    dept_code : string 
    job_no : string 
    remarks : string 
    contact_person : string 
    can_ind : string 
    fy_code : string 
    item_type : string 
    sys1_user : string 
    sys1_start_date : Date  
    sys1_date : Date  
    br_code : string 
    location_type : string 
    acc_code : string 
    created_user : string 
    approval_ind : string 
    req_by : string 
    acc_name : string 
    request_for_subcontractor : string 
    adv_date : Date  
    adv_user : string 
    serv_type : string 
    serv_name : string 
    site_po : string 
    mrq_approval_ind : string 
    withinbud : string 
    client_name : string    
    location_name :string  
    VMdw_material_request_details: Array<VMdw_material_request_detail>;  
}

export interface VMdw_material_request_detail { 

        trc_code : string 
        vr_no : number 
        vr_date : Date  
        ite_code : string 
        ite_qty : number 
        ite_rate : number 
        qty : number 
        sign_int : number 
        ite_name : string 
        sr_no : number 
        ite_unit : string 
        can_int : string 
        fy_code : string 
        base_rate : number 
        specification : string 
        job_no : string 
        request_qty : number 
        activity : string 
        work_order_no : string 
        segment_no : string 
        x_request_qty : number 
        x_ite_qty : number 
        x_unit : string 
        x_factor : number 
        required_date : Date  
        br_code : string 
        remarks : string 
        part_code : string 
        wbs : string 
        from_date : Date  
        to_date : Date  
        asset_ind : string 
        po_closed_qty : number 
        closed_request_qty : number 
        ref_vr_no : string 
        ref_sr_no : number 
        budget_approved_amt : number 
        x_purchase_advised : number 
        purchase_advised : number 
        ref_trc : string 
        ref_vrno : number 
        ref_srno : number 
        ref_dsrno : number 
        billing_unit : string 
        billing_qty : number 
        exp_acc_code : string 
        exp_category : string 
        exp_group : string 
        exp_category_name : string 
        exp_subgroup : string 
        x_cash_qty : number 
        cash_qty : number 
        grn_qty : number 
        qbac : number 
        qpendingmrq : number 
        qpendingpo : number 
        qstock : number 
        qactual : number 
        qbalance : number 
        qbudgetrate : number 
        qlastporate : number 
        qlowestpo : number 
        qmasterrate : number 
        bac : number 
        pendingmrq : number 
        pendingpo : number 
        stock : number 
        actual : number 
        balance : number 
        earnedvalue : number 
        method : string 
        rrate : number 
        amt : number 
        rreason : string 
        rate_tye : string 
        gbac : number 
        gpendingmrq : number 
        gpendingpo : number 
        gstock : number 
        gactual : number 
        gbalance : number 
        ev_qty : number 
        ev_per : number 
        validation_level : number 
        acticvity_name : string 
        grp_name : string 
        job_head_budg : string 
        job_head_budg_name : string 
        prod_item : string 
}


export interface children3 { 

	id      : string,
	title   : string,
	translate: string,
	type    : string, 
	url		: string,
}
export interface children2 {
 

	id      : string,
	title   : string,
	type    : string,
    url		: string,
	children?: children3[];
}

export interface children1 {
  
                    
	id      : string,
	title   : string,
	type    : string,
	icon    : string,
	children?: children2[];
}

export interface menu_head {
   
	id      : string,
	title   : string,
	translate: string,
	type    : string,
	icon	: string, 
     children?: children1[];
 }

 
export interface iButtons {
    lb_new:boolean;
    lb_first:boolean;
    lb_last:boolean;
    lb_next:boolean;
    lb_prior:boolean;
    lb_save:boolean;
    lb_delete:boolean;
    lb_print:boolean;
    lb_listing:boolean;
    lb_cheque:boolean;
    lb_void:boolean;
    lb_approve:boolean;
    lb_status:boolean;
    lb_attach:boolean;
    lb_browse:boolean;
    lb_custom_fields:boolean;
    lb_import:boolean;
    lb_undo:boolean;
    lb_send:boolean; 
    lb_refresh:boolean;  
    lb_close:boolean; 
}

