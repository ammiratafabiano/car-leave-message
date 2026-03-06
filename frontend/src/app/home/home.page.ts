import { Component } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  sender = "";
  content = "";
  phone = "";

  constructor(
    private apiService: ApiService,
    private alertCtrl: AlertController
    ) { }

  refresh(ev: any) {
    
  }

  sendMessage() {
    this.apiService.sendMessage(this.sender, this.content, this.phone).subscribe(response => {
      this.alertCtrl.create({
        header: 'Info',
        message: response.success ? "Messaggio inviato!" : "Errore nell'invio. Riprova.",
        buttons: ['OK']
      }).then(res => {
        res.present();
      });
    });
  }

}
