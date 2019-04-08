import {Component} from '@angular/core';
import {AngularFirestore} from '@angular/fire/firestore';
import {ToastController} from '@ionic/angular';

@Component({
    selector: 'app-home',
    templateUrl: 'home.page.html',
    styleUrls: ['home.page.scss'],
})
export class HomePage {

    public siren = false;
    public state = false;
    public count: number;
    private sufix: string;
    private currentDay: Date;

    constructor(private db: AngularFirestore,
                private toastController: ToastController) {

        this.currentDay = new Date();
        const collection = this.db.collection('date');
        collection.valueChanges().subscribe(item => {
                this.count = (this.currentDay.getTime() - item[0]['lastDateIncindent']) / (1000 * 60 * 60 * 24);
                this.count = Math.floor(this.count);
                this.lastDigitToWord(this.count);
            }
        );
    }

    alarm() {
        if (this.count > 0) {
            this.siren = true;
            const interval = setInterval(() => {
                this.state = !this.state;
            }, 100);
            const audio = new Audio('./assets/sound/alarm.mp3');
            audio.play();
            setTimeout(() => {
                clearInterval(interval);
                this.db.collection('date').doc('incindent').set({lastDateIncindent: this.currentDay.getTime()});
                this.siren = false;
                audio.pause();
                this.loh();
            }, 10000);
        } else {
            this.toster();
        }
    }

    async toster() {
        const toast = await this.toastController.create({
            message: 'ЕБАНУЛСЯ? СЕГОДНЯ Ж ТОЛЬКО ОБМАЗАЛСЯ!!!',
            duration: 2000,
            position: 'top',
            color: 'dark'
        });
        toast.present();
    }

    async loh() {
        const toast = await this.toastController.create({
            message: `ЕБАТЬ ТЫ ЛОХ!!!! ВСЕГО ${this.count} ${this.sufix} ПРОДЕРЖАЛСЯ`,
            duration: 2000,
            position: 'top',
            color: 'dark'
        });
        toast.present();
    }

    lastDigitToWord(digit) {
        const lastFigure = parseInt(digit.toString().substr(digit.toString().length - 1, 1), 10);
        if (digit > 11 && digit < 15) {
            this.sufix =  'ДНЕЙ';
        } else {
            if (lastFigure === 1) {
                this.sufix =  'ДEНЬ';
            }
            if (lastFigure > 1 && lastFigure < 5) {
                this.sufix =  'ДНЯ';
            }
            if (lastFigure === 0 || lastFigure >= 5) {
                this.sufix =  'ДНЕЙ';
            }
        }
    }

}
