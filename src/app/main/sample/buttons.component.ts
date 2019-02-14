import {Component, OnInit, Input, Output, EventEmitter} from '@angular/core';   
import { iButtons } from './sample.data';

@Component({ selector: 'buttons',  templateUrl: './buttons.component.html'  })

export class BaseWindowbuttons implements OnInit {
  
    @Input() libutton:iButtons;
    @Output() ld_ue_exit = new EventEmitter<string>();
    @Output() ld_ue_new = new EventEmitter<string>();
    @Output() ld_ue_first = new EventEmitter<string>();
    @Output() ld_ue_last = new EventEmitter<string>();
    @Output() ld_ue_next = new EventEmitter<string>();
    @Output() ld_ue_prior = new EventEmitter<string>();
    @Output() ld_ue_save = new EventEmitter<string>();
    @Output() ld_ue_delete = new EventEmitter<string>();
    @Output() ld_ue_print = new EventEmitter<string>();
    @Output() ld_ue_listing = new EventEmitter<string>();
    @Output() ld_ue_cheque = new EventEmitter<string>();
    @Output() ld_ue_void = new EventEmitter<string>();
    @Output() ld_ue_approve = new EventEmitter<string>();
    @Output() ld_ue_status = new EventEmitter<string>();
    @Output() ld_ue_attach = new EventEmitter<string>();
    @Output() ld_ue_browse = new EventEmitter<string>();
    @Output() ld_ue_custom_fields = new EventEmitter<string>();
    @Output() ld_ue_import = new EventEmitter<string>();
    @Output() ld_ue_undo = new EventEmitter<string>();
    @Output() ld_ue_send = new EventEmitter<string>(); 
    @Output() ld_ue_refresh = new EventEmitter<string>();
    @Output() ld_ue_close = new EventEmitter<string>();

    ngOnInit() {
    }
   
    ue_exit(){this.ld_ue_exit.emit('ue_exit');}
    ue_new(){this.ld_ue_new.emit('ue_new');}
    ue_first(){this.ld_ue_first.emit('ue_first');}
    ue_last(){this.ld_ue_last.emit('ue_last');}
    ue_next(){this.ld_ue_next.emit('ue_next');}
    ue_prior(){this.ld_ue_prior.emit('ue_prior');}
    ue_save(){this.ld_ue_save.emit('ue_save');}
    ue_delete(){this.ld_ue_delete.emit('ue_delete');}
    ue_print(){this.ld_ue_print.emit('ue_print');}
    ue_listing(){this.ld_ue_listing.emit('ue_listing');}
    ue_cheque(){this.ld_ue_cheque.emit('ue_cheque');}
    ue_void(){this.ld_ue_void.emit('ue_void');}
    ue_approve(){this.ld_ue_approve.emit('ue_approve');}
    ue_status(){this.ld_ue_status.emit('ue_status');}
    ue_attach(){this.ld_ue_attach.emit('ue_attach');}
    ue_browse(){this.ld_ue_browse.emit('ue_browse');}
    ue_custom_fields(){this.ld_ue_custom_fields.emit('ue_custom_fields');}
    ue_import(){this.ld_ue_import.emit('ue_import');}
    ue_undo(){this.ld_ue_undo.emit('ue_undo');}
    ue_send(){this.ld_ue_send.emit('ue_send');} 
    ue_refresh(){this.ld_ue_refresh.emit('ue_refresh');}
    ue_close(){this.ld_ue_close.emit('ue_close');}

}


