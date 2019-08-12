using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.IO;


namespace Reader
{
    class Program
    {
       // public static System.Text.Encoding OutputEncoding = UTF8Encoding.Default;
        static void Main(string[] args)
        {
            
            try
            {
                try
                {
                    FileStream file1 = new FileStream(Environment.CurrentDirectory + "\\native\\language\\ru.json", FileMode.Open); //создаем файловый поток
                    StreamReader reader = new StreamReader(file1); // создаем «потоковый читатель» и связываем его с файловым потоком

                    var text = System.Convert.ToBase64String(System.Text.Encoding.UTF8.GetBytes(reader.ReadToEnd()));
                    //  System.Convert.ToBase64String(reader.ReadToEnd()); - ОШИБКА
                    Console.Write(text); //считываем все данные с потока и выводим на экран
                    reader.Close(); //закрываем поток
                }
                catch (System.IO.DirectoryNotFoundException) {
                    Console.Write("Err" + Environment.CurrentDirectory + "\\native\\language\\ru.json");
                }
                //FileStream file1 = new FileStream(Environment.CurrentDirectory + "native\\language\\ru.json", FileMode.Open); //создаем файловый поток
       
               // Console.ReadLine();

            }
            catch (System.IO.FileNotFoundException)
            {
                Console.Write("Language file is not found! " + Environment.CurrentDirectory  +"\\test.txt");
               // Console.ReadLine();
            }
       
           
        }
    }
}
